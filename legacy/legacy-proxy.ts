// Задание для кандитата:
// **Дано:** В наличии сервис, отвечающий за авторизацию, проксирование к внешим API сервисим (Moralis, Reservoir), кэширование данных, который задумывался как прокси, но оброс самостоятельным функционалом. Cтек: express, js, axios, apolo, redis. 
// **Что сделать:** Необходимо переписать сервис авторизации и обработчик проксирования с JS на TS, фреймворк заменить Express на Nest 
// Механизм JWT авторизации в части обращения к backend.local:8000 необходимо реализовать внутри нового сервиса.




var express = require("express");
var { polygonApi } = require("../utils/polygonAPI");
const { default: axios } = require("axios");
const { redis } = require("../shared/cache");
var router = express.Router();

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("index", { title: "Express" });
});

//auth
router.get("/api/auth/payload", async (req, res) => {
  try {
    const response = await axios.get(
      "http://backend.local:8000/api/v1/auth/payload",
      {
        // headers: req.headers
      }
    );
    res.json(response.data);
  } catch (error) {
    console.error(error); //to right logging service
    res.status(500).json({ error: "Internal Server Error" }); //discuss about error status codes
  }
});

router.post("/api/auth/refresh", async (req, res) => {
  try {
    // Логирование полученных заголовков
    console.log("Полученные заголовки:", req.headers);
    console.log("Полученные куки:", req.cookies);
    const refresh_token = req?.cookies?.refresh_token;
    const access_token = req?.cookies?.access_token;

    if (!refresh_token && !access_token) {
      console.log("Токен обновления и токен доступа отсутствуют");
      return res.status(403).json({ error: "Invalid refresh token" });
    }

    // Создаем копию заголовков, чтобы изменить `host`
    const headers = { cookie: req.headers.cookie };

    const response = await axios.post(
      "http://backend.local:8000/api/v1/auth/refresh",
      {},
      {
        headers,
      }
    );

    // Логирование заголовков и данных ответа
    console.log("Заголовки ответа:", response.headers);
    console.log("Данные ответа:", response.data);

    // Устанавливаем заголовки и отправляем данные ответа клиенту
    res.set(response.headers);
    res.json(response.data);
  } catch (error) {
    console.error(error);
    if (error.response) {
      console.error("Данные ответа об ошибке:", error.response.data);
      console.error("Статус ответа об ошибке:", error.response.status);
      console.error("Заголовки ответа об ошибке:", error.response.headers);
    } else {
      console.error("Ошибка без ответа от бэкенда:", error.message);
    }
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/api/auth/verify", async (req, res) => {
  try {
    const response = await axios.post(
      "http://backend.local:8000/api/v1/auth/verify",
      req.body,
      {
        headers: req.headers,
      }
    );
    // console.log(response.headers)
    res.set(response.headers); // Исправленная строка
    res.json(response.data);
  } catch (error) {
    console.error(error); //to right logging service
    res.status(500).json({ error: "Internal Server Error" }); //discuss about error status codes
  }
});

//OK
//для всех юзеров кеш
//Время жизни кеша 1 минута
//нужно ли сейчас это кешировать, если наверное это используется только для explore, который сейчас не выкатываем
//ПРОТЕСТИТЬ только ли в explore и большом профайле
//TODO: add caching and validation by whitelist and subraphs list faric))
router.get("/api/:chain/collections", async (req, res) => {
  try {
    const { chain } = req.params;
    const contracts = req.query.contract; // Can be an array or a single string
    console.log({ chain, contracts });
    // TODO: unify validation fields
    if (!contracts || !chain)
      return res.status(400).json({ error: "Bad request" });
    // Ensure contracts is always an array
    const contractList = Array.isArray(contracts) ? contracts : [contracts];
    const queryString = contractList.map((c) => `contract=${c}`).join("&");
    const response = await polygonApi.get(
      `https://api-${chain}.reservoir.tools/collections/v7?${queryString}`
    );
    res.json(response.data);
  } catch (error) {
    console.error(error); //to right logging service
    res.status(500).json({ error: "Internal Server Error" }); //discuss about error status codes
  }
});

router.post("/api/multichain/collections", async (req, res) => {
  try {
    const { collections } = req.body;

    // TODO: unify validation fields
    if (!collections || !Array.isArray(collections)) {
      return res.status(400).json({ error: "Collections should be an array" });
    }

    // Группируем контракты по цепочкам
    const collectionsByChain = {};
    for (let i = 0; i < collections.length; i++) {
      const { chain, contract } = collections[i];
      if (!chain || !contract) {
        continue; // Пропускаем итерацию, если цепочка или контракт отсутствуют
      }
      if (!collectionsByChain[chain]) {
        collectionsByChain[chain] = [];
      }
      collectionsByChain[chain].push(contract);
    }

    //Promise.all для мультизапросов параллельно
    const promises = Object.entries(collectionsByChain).map(
      async ([chain, contracts]) => {
        try {
          const queryString = contracts.map((c) => `contract=${c}`).join("&");
          const response = await polygonApi.get(
            `https://api-${chain}.reservoir.tools/collections/v7?${queryString}`
          );
          return response.data.collections || [];
        } catch (error) {
          console.error(`Error fetching data for chain ${chain}`, error);
          return []; // Возвращаем пустой массив в случае ошибки
        }
      }
    );
    const results = (await Promise.all(promises)).flat();

    res.json({
      collections: results,
    });
  } catch (error) {
    console.error(error); // to right logging service
    res.status(500).json({ error: "Internal Server Error" }); // discuss about error status codes
  }
});

router.post("/api/multichain/users/:userAddress/tokens", async (req, res) => {
  try {
    const { userAddress } = req.params;
    const { collections } = req.body;

    if (!collections || !Array.isArray(collections)) {
      return res.status(400).json({ error: "Collections should be an array" });
    }
    console.log({ userAddress, collections });
    // Группируем коллекции по цепочкам
    const collectionsByChain = {};
    for (let i = 0; i < collections.length; i++) {
      const { chain, collection } = collections[i];
      console.log({ chain, collection });
      if (!chain || !collection) {
        continue; // Пропускаем итерацию, если цепочка или коллекция отсутствуют
      }
      if (!collectionsByChain[chain]) {
        collectionsByChain[chain] = [];
      }
      collectionsByChain[chain].push(collection);
    }
    console.log({ collectionsByChain });

    const promises = Object.entries(collectionsByChain).map(
      async ([chain, collections]) => {
        try {
          const queryString = collections
            .map((col) => `collection=${col}`)
            .join("&");
          const response = await polygonApi.get(
            `https://api-${chain}.reservoir.tools/users/${userAddress}/tokens/v10?${queryString}`
          );
          return response.data.tokens || [];
        } catch (error) {
          console.error(`Error fetching data for chain ${chain}`, error);
          return []; // Возвращаем пустой массив в случае ошибки
        }
      }
    );

    const results = (await Promise.all(promises)).flat();

    res.json({
      tokens: results,
    });
  } catch (error) {
    console.error(error); // to right logging service
    res.status(500).json({ error: "Internal Server Error" }); // discuss about error status codes
  }
});

//OK
//нужно ли кешировать вообще?
//1 час
//может быть вынести в env время жизни
//для всех одинаково, общий кеш

//api/polygon/collectionsSet
//api/base/collectionsSet
router.get("/api/:chain/collectionsSet", async (req, res) => {
  try {
    const { chain } = req.params;
    // const { contract } = req.query; //if contract param is not passed will return error too
    // const collectionsSet =
    //   "b8121cfb7bfe60cf9b2e84d4da1262fb2626f2f96eb7352085d181ce0b2c8a72";

    let collectionsSetId = process.env.COLLECTIONS_SET_ID;
    if (chain !== "polygon") {
      collectionsSetId =
        process.env[`COLLECTIONS_SET_ID_${chain.toUpperCase()}`];
    }

    //without support eth syntax
    const response = await polygonApi.get(
      `https://api-${chain}.reservoir.tools/collections/v7?collectionsSetId=${collectionsSetId}`
    );
    res.json(response.data);
  } catch (error) {
    console.error(error); //to right logging service
    res.status(500).json({ error: "Internal Server Error" }); //discuss about error status codes
  }
});


router.get("/api/polygon/tokens/token-price", async (req, res) => {
  //`http://backend.local:8000/api/v1/tokens/${token}/price`
  try {
    const { address } = req.query;
    const response = await polygonApi.get(
      `http://backend.local:8000/api/v1/tokens/${address}/price`
    );
    res.json(response.data);
  } catch (error) {
    console.error(error); //to right logging service
    //открой файлик и запиши ошибку
    res.status(500).json({ error: "Internal Server Error" }); //discuss about error status codes
  }
});

router.get("/api/:chain/users/:userAddress/tokens", async (req, res) => {
  try {
    const { userAddress, chain } = req.params;
    // console.log(req.query);
    // const { continuation, includeAttributes } = req.query;
    const collection = req.query?.collection;
    const collectionsSetId = req.query?.collectionsSetId;
    //continuation -- это когда мы хотим переходить к следующей странице, там хранится хеш для предыдущей страницы. одинаковый в рамках одной сессии у юзера
    //если continuation нет, то это первая страница
    const continuation = req.query?.continuation;
    //includeAttributes -- true/false
    //необзательные метаданные для токенов, вроде цвета кожи, редкости
    const includeAttributes = req.query?.includeAttributes;
    let response;
    if (collection) {
      response = await polygonApi.get(
        `https://api-${chain}.reservoir.tools/users/${userAddress}/tokens/v9?collection=${collection}${
          continuation ? `&continuation=${continuation}` : ""
        }${includeAttributes ? `&includeAttributes=${includeAttributes}` : ""}`
      );
    } else if (collectionsSetId) {
      response = await polygonApi.get(
        `https://api-${chain}.reservoir.tools/users/${userAddress}/tokens/v10?collectionsSetId=${collectionsSetId}${
          continuation ? `&continuation=${continuation}` : ""
        }${includeAttributes ? `&includeAttributes=${includeAttributes}` : ""}`
      );
    }
    // console.log(response);
    res.json(response.data);
  } catch (error) {
    console.error(error); //to right logging service
    res.status(500).json({ error: "Internal Server Error" }); //discuss about error status codes
  }
});


const methods_to_cache_with_timings = [
  { method: "eth_gasPrice", timing: 5 },
  { method: "eth_blockNumber", timing: 5 },
  { method: "eth_getBalance", timing: 30 },
];
const base_rpcUrl = process.env.CHAINSTACK_BASE_RPC ?? "";
const rpcUrl = process.env.CHAINSTACK_RPC ?? "";

router.post("/api/:chain/wagmi", async (req, res) => {
  try {
    // console.log(req.body);
    // console.log(req.headers);
    // console.log(req)
    // console.log(rpcUrl);
    const { chain } = req.params;

    const current_rpcUrl = chain === "base" ? base_rpcUrl : rpcUrl;
    const {
      method = "eth_gasPrice",
      params = [],
      id = 1,
      jsonrpc = "2.0",
    } = req.body;
    const method_to_cache = methods_to_cache_with_timings.find(
      (m) => m.method === method
    );
    if (method_to_cache) {
      const { timing } = method_to_cache;
      let cacheKey = `blockchain_info:${chain}:${method}`;

      let cachedData = null;
      if (params.length === 0) {
        cachedData = await redis.call("JSON.GET", cacheKey);
      } else {
        cacheKey = `blockchain_info:${chain}:${method}:${params.join(":")}`;
        //FT.CREATE blockchain_info_params ON JSON SCHEMA $.params[*] AS param TAG
        const paramsTags = params.map((param) => `@param:{${param}}`).join(" ");
        console.log(paramsTags);
        //@param:{0x987e55d51A9939B2cEE2F16d1A946cC1F7bFaEF6} @param:{latest}
        const searchResults = await redis.call(
          "FT.SEARCH",
          "blockchain_info_params",
          paramsTags,
          "LIMIT",
          "0",
          "1"
        );
        console.log(searchResults);

        cachedData = searchResults[0] > 0 ? searchResults[2][1] : null;
        console.log("cachedData", cachedData);
      }

      const reponse_to_client = {
        jsonrpc,
        id,
        result: null,
      };
      if (cachedData) {
        const cachedDataParsed = JSON.parse(cachedData);
        reponse_to_client.result = cachedDataParsed?.result || cachedDataParsed;
      } else {
        const response = await axios.post(current_rpcUrl, req.body, {
          // headers: req.headers
        });
        const { result } = response.data;

        const dataToCache = JSON.stringify({ params, result });
        reponse_to_client.result = result;

        await redis.call("JSON.SET", cacheKey, "$", dataToCache);
        await redis.call("EXPIRE", cacheKey, timing);
      }
      return res.json(reponse_to_client);
    }

    const response = await axios.post(current_rpcUrl, req.body, {
      // headers: req.headers
    });
    res.json(response.data);
  } catch (error) {
    console.error(error);
    console.log(error.stack); //to right logging service
    res.status(500).json({ error: "Internal Server Error" }); //discuss about error status codes
  }
});

router.get("/api/:chain/wagmi", async (req, res) => {
  try {
    const { chain } = req.params;

    const current_rpcUrl = chain === "base" ? base_rpcUrl : rpcUrl;
    // Если есть параметры запроса, вы должны передать их в URL или использовать параметр `params`
    const response = await axios.get(current_rpcUrl, {
      params: req.query, // параметры из строки запроса
      // headers: req.headers // заголовки запроса
    });
    res.json(response.data);
  } catch (error) {
    // console.error(error); //to right logging service
    res.status(500).json({ error: "Internal Server Error" }); //discuss about error status codes
  }
});
//OK
router.get("/api/tokens", async (req, res) => {
  try {
    const { includeAttributes, continuation } = req.query;
    const tokens = req.query?.tokens;
    const collection = req.query?.collection;

    let response;
    if (tokens) {
      response = await polygonApi.get(
        `https://api-polygon.reservoir.tools/tokens/v7?tokens=${tokens}${
          includeAttributes ? `&includeAttributes=${includeAttributes}` : ""
        }${continuation ? `&continuation=${continuation}` : ""}`
      );
    } else if (collection) {
      response = await polygonApi.get(
        `https://api-polygon.reservoir.tools/tokens/v7?collection=${collection}${
          includeAttributes ? `&includeAttributes=${includeAttributes}` : ""
        }${continuation ? `&continuation=${continuation}` : ""}`
      );
    }

    res.json(response.data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" }); //discuss about error status codes
  }
});
//V2
router.get("/api/:chain/tokens", async (req, res) => {
  try {
    const { chain } = req.params;
    const { includeAttributes, continuation } = req.query;
    const tokens = req.query?.tokens;
    const collection = req.query?.collection;

    let response;
    if (tokens) {
      response = await polygonApi.get(
        `https://api-${chain}.reservoir.tools/tokens/v7?tokens=${tokens}&sortBy=tokenId${
          includeAttributes ? `&includeAttributes=${includeAttributes}` : ""
        }${continuation ? `&continuation=${continuation}` : ""}`
      );
    } else if (collection) {
      response = await polygonApi.get(
        `https://api-${chain}.reservoir.tools/tokens/v7?collection=${collection}&sortBy=tokenId${
          includeAttributes ? `&includeAttributes=${includeAttributes}` : ""
        }${continuation ? `&continuation=${continuation}` : ""}`
      );
    }

    res.json(response.data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" }); //discuss about error status codes
  }
});


router.get("/api/quotes", async (req, res) => {
  const { address, chain } = req.query;
  if (!address || !chain) {
    return res.status(400).json({ error: "Bad request" });
  }
  const cacheKey = `endpoint:/api/quotes:${address}:${chain}`;
  try {
    // Try to get data from Redis cache
    const cachedData = await redis.get(cacheKey);
    if (cachedData) {
      console.log("Cache hit");
      return res.json(JSON.parse(cachedData));
    }
    const response = await axios.get(
      `https://deep-index.moralis.io/api/v2.2/erc20/${address}/price?chain=${chain}&include=percent_change`,
      {
        headers: {
          accept: "application/json",
          "X-API-Key": process.env.MORALIS_API_KEY,
        },
      }
    );
    // Cache the API response in Redis and return the data
    const dataToCache = JSON.stringify(response.data);
    await redis.set(cacheKey, dataToCache, "EX", 10); // Cache for 5 minutes
    res.json(response.data);
  } catch (error) {
    console.error(error); //to right logging service
    res.status(500).json({ error: "Internal Server Error" }); //discuss about error status codes
  }
});

router.post("/api/multichain/quotes", async (req, res) => {
  const default_exchange = "uniswapv2";
  const { tokens } = req.body;
  if (!tokens || !Array.isArray(tokens)) {
    return res.status(400).json({ error: "Bad request" });
  }

  try {
    const promises = tokens.map(async (token) => {
      const cacheKey = `endpoint:/api/multichain/quotes:${token.address}:${
        token.chain
      }:${token.exchange || default_exchange}`;
      const cachedData = await redis.get(cacheKey);
      if (cachedData) {
        console.log("Cache hit");
        return JSON.parse(cachedData);
      }
      let token_result = {
        system_info: {
          success: true,
          chain: token.chain,
          address: token.address,
          exchange: token.exchange,
        },
      };
      try {
        const response = await axios.get(
          `https://deep-index.moralis.io/api/v2.2/erc20/${
            token.address
          }/price?chain=${token.chain}&include=percent_change${
            token.exchange
              ? `&exchange=${token.exchange}`
              : `&exchange=${default_exchange}`
          }&min_pair_side_liquidity_usd=0`,
          {
            headers: {
              accept: "application/json",
              "X-API-Key": process.env.MORALIS_API_KEY,
            },
          }
        );
        const dataToCache = JSON.stringify(response.data);
        await redis.set(cacheKey, dataToCache, "EX", 10); // Cache for 5 minutes

        return { ...token_result, ...response.data };
      } catch (error) {
        console.error(error); //to right logging service
        console.log(error.response.data);
        token_result.system_info.success = false;
        token_result.system_info.error =
          error?.response?.data?.message || "Unknown error";

        return { ...token_result };
      }

      // const
    });

    const results = await Promise.all(promises);
    res.json({ tokens: results });
  } catch (error) {
    console.error(error); //to right logging service
    res.status(500).json({ error: "Internal Server Error" }); //discuss about error status codes
  }
});


router.get("/api/multichain/naps/search", async (req, res) => {
  try {
    console.log(req.query);
    const { search } = req.query;
    let result_naps = []
    if (search) {
      console.log(search);
      const sanitizedValue = search.replace(/[^a-zA-Z0-9]/g, "");
      const lowerCaseValue = sanitizedValue.toLowerCase();
      const isEthereumAddress = (search) => {
        return /^0x[a-fA-F0-9]{40}$/.test(search);
      };
      console.log(lowerCaseValue);
      if (isEthereumAddress(lowerCaseValue)) {
        const keys = await redis.keys(`nap:nap_item:*:${lowerCaseValue}`);
        console.log(keys);
        if (keys.length > 0) {
          const naps = await redis.call("JSON.MGET", ...keys, ".");
          const naps_parsed = naps.map((nap) => JSON.parse(nap));
          result_naps = await populateNaps(naps_parsed)
          return res.json({ naps: result_naps });
        } else if (keys.length === 0) {
          //// FT.CREATE napCollectionAddressIndex ON JSON SCHEMA $.collectionAddress AS collectionAddress TAG
          const searchResults = await redis.call(
            "FT.SEARCH",
            "napCollectionAddressIndex",
            `@collectionAddress:{${lowerCaseValue}}`
          );
          if (searchResults[0] > 0) {
            const naps = searchResults.filter((item) => Array.isArray(item)).map((item) => JSON.parse(item[1]))
            result_naps = await populateNaps(naps)
            return res.json({ naps: result_naps });
          }
        } else {
          return res.json({ naps: result_naps });
        }
      }
    }
    return res.json({ naps: result_naps });
  } catch (error) {
    console.error(error); //to right logging service
    res.status(500).json({ error: "Internal Server Error" }); //discuss about error status codes
  }
});

router.get("/api/multichain/just_naps", async (req, res) => {
  try {
    let result_naps = []
    const searchResults = await redis.call(
      "FT.SEARCH",
      "isVerifiedIndex",
      `@isVerified:{true}`
    );
    console.log(searchResults);

    if (searchResults[0] > 0) {
      result_naps = searchResults.filter((item) => Array.isArray(item)).map((item) => JSON.parse(item[1]))
    }

    res.json({ naps: result_naps });
  } catch (error) {
    console.error(error); //to right logging service
    res.status(500).json({ error: "Internal Server Error" }); //discuss about error status codes
  }
});

async function fetchTokenMetadataFromAPI(tokenAddresses, chain) {
  const response = await axios.get(
    `https://deep-index.moralis.io/api/v2.2/erc20/metadata?chain=${chain}&addresses=${tokenAddresses.join(
      "&addresses="
    )}`,
    {
      params: {},
      headers: {
        accept: "application/json",
        "X-API-Key": process.env.MORALIS_API_KEY,
      },
    }
  );
  return response.data;
}


function getExchangeForChain(chain) {
  switch (chain) {
    case "polygon":
      return "quickswapv2";
    case "base":
      return "uniswapv2";
    default:
      return "uniswapv3";
  }
}

async function fetchPricesFromAPI(tokens, chain) {
  const response = await axios.post(
    `https://deep-index.moralis.io/api/v2.2/erc20/prices?chain=${chain}&include=percent_change`,
    {
      tokens,
    },
    {
      headers: {
        accept: "application/json",
        "X-API-Key": process.env.MORALIS_API_KEY,
        "content-type": "application/json",
      },
    }
  );
  return response.data;
}

async function fetchCollectionMetadataFromAPI(collectionAddresses, chain) {
  const queryString = collectionAddresses.map((c) => `contract=${c}`).join("&");
  const response = await polygonApi.get(
    `https://api-${chain}.reservoir.tools/collections/v7?${queryString}`
  );
  return response.data.collections || [];
}

async function populateNaps(naps){
      /**
     * {
     *  polygon: new Set(),
     * base: new Set(),
     * ...etc
     */
  const uniqueChains = [...new Set(naps.map((nap) => nap.chain))];
  const uniqueErc20TokensByChain = {};
  const uniqueCollectionsByChain = {};
  // Инициализируем объект для каждой уникальной сети
  for (const chain of uniqueChains) {
    uniqueErc20TokensByChain[chain] = new Set();
    uniqueCollectionsByChain[chain] = new Set();
  }

  for (const nap of naps) {
    if (nap?.assuranceToken?.id) {
      uniqueErc20TokensByChain[nap.chain].add(nap.assuranceToken.id);
    }

    if (nap?.collateralToken?.id) {
      uniqueErc20TokensByChain[nap.chain].add(nap.collateralToken.id);
    }

    if (nap?.collectionAddress) {
      uniqueCollectionsByChain[nap.chain].add(nap.collectionAddress);
    }
  }
  // console.log("uniqueErc20TokensByChain", uniqueErc20TokensByChain);
  // console.log("uniqueCollectionsByChain", uniqueCollectionsByChain);

  let uniqueCollectionsByChainMetadata = {};
  let uniqueCollectionsByChainMetadata_missing_in_cache = {};

  let uniqueErc20TokensByChainMetadata = {};
  let uniqueErc20TokensByChainMetadata_missing_in_cache = {};
  for (const chain of uniqueChains) {
    uniqueErc20TokensByChainMetadata = {
      ...uniqueErc20TokensByChainMetadata,
      [chain]: {},
    };
    uniqueErc20TokensByChainMetadata_missing_in_cache = {
      ...uniqueErc20TokensByChainMetadata_missing_in_cache,
      [chain]: [],
    };

    uniqueCollectionsByChainMetadata = {
      ...uniqueCollectionsByChainMetadata,
      [chain]: {},
    };
    uniqueCollectionsByChainMetadata_missing_in_cache = {
      ...uniqueCollectionsByChainMetadata_missing_in_cache,
      [chain]: [],
    };
  }
  const obj_entries_uiniqueErc20TokensByChain = Object.entries(
    uniqueErc20TokensByChain
  );

  const obj_entries_uiniqueCollectionsByChain = Object.entries(
    uniqueCollectionsByChain
  );

  for (const [chain, setted] of obj_entries_uiniqueErc20TokensByChain) {
    for (const erc20Token of setted) {
      let erc20TokenMetadata = await redis.call(
        "JSON.GET",
        `metadata:${chain}:ERC20:${erc20Token}`
      );
      erc20TokenMetadata = JSON.parse(erc20TokenMetadata);
      if (erc20TokenMetadata) {
        uniqueErc20TokensByChainMetadata[chain][erc20Token] =
          erc20TokenMetadata;
      } else {
        uniqueErc20TokensByChainMetadata_missing_in_cache[chain].push(
          erc20Token
        );
      }
    }
  }

  for (const [chain, setted] of obj_entries_uiniqueCollectionsByChain) {
    for (const collection of setted) {
      console.log("collection", collection);
      let collectionMetadata = await redis.call(
        "JSON.GET",
        `metadata:${chain}:COLLECTION:${collection}`
      );
      collectionMetadata = JSON.parse(collectionMetadata);
      if (collectionMetadata) {
        uniqueCollectionsByChainMetadata[chain][collection] =
          collectionMetadata;
      } else {
        uniqueCollectionsByChainMetadata_missing_in_cache[chain].push(
          collection
        );
      }
    }
  }

  const obj_entries_uniqueErc20TokensByChainMetadata_missing_in_cache =
    Object.entries(uniqueErc20TokensByChainMetadata_missing_in_cache);

  const obj_entries_uniqueCollectionsByChainMetadata_missing_in_cache =
    Object.entries(uniqueCollectionsByChainMetadata_missing_in_cache);

  // console.log(obj_entries_uniqueErc20TokensByChainMetadata_missing_in_cache);

  for (const [
    chain,
    array,
  ] of obj_entries_uniqueErc20TokensByChainMetadata_missing_in_cache) {
    if (array.length === 0) continue;
    const erc20TokensMetadata = await fetchTokenMetadataFromAPI(array, chain);
    for (let erc20TokenMetadata of erc20TokensMetadata) {
      const { address } = erc20TokenMetadata;
      erc20TokenMetadata = { ...erc20TokenMetadata, chain };
      //future do multi()
      await redis.call(
        "JSON.SET",
        `metadata:${chain}:ERC20:${address}`,
        "$",
        JSON.stringify(erc20TokenMetadata)
      );
      uniqueErc20TokensByChainMetadata[chain][address] = erc20TokenMetadata;
    }
  }
  // console.log("uniqueErc20TokensByChainMetadata", uniqueErc20TokensByChainMetadata);

  // console.log("obj_entries_uniqueCollectionsByChainMetadata_missing_in_cache", obj_entries_uniqueCollectionsByChainMetadata_missing_in_cache);

  for (const [
    chain,
    array,
  ] of obj_entries_uniqueCollectionsByChainMetadata_missing_in_cache) {
    if (array.length === 0) continue;
    const collectionsMetadata = await fetchCollectionMetadataFromAPI(
      array,
      chain
    );
    for (let collectionMetadata of collectionsMetadata) {
      const { id } = collectionMetadata;
      collectionMetadata = { ...collectionMetadata, chain };
      //future do multi()
      await redis.call(
        "JSON.SET",
        `metadata:${chain}:COLLECTION:${id}`,
        "$",
        JSON.stringify(collectionMetadata)
      );
      uniqueCollectionsByChainMetadata[chain][id] = collectionMetadata;
    }
  }

  for (const nap of naps) {
    if (nap?.assuranceToken?.id) {
      nap.assuranceToken.metadata =
        uniqueErc20TokensByChainMetadata[nap.chain][nap.assuranceToken.id];
    }

    if (nap?.collateralToken?.id) {
      nap.collateralToken.metadata =
        uniqueErc20TokensByChainMetadata[nap.chain][nap.collateralToken.id];
    }

    if (nap?.collectionAddress) {
      nap.collection_metadata =
        uniqueCollectionsByChainMetadata[nap.chain][nap.collectionAddress];
    }
  }
  return naps;
}

// TODO: unify data schemas for ERC20, ERC721, ERC1155
//TODO: add correct TTL for redis for Metadata
//TODO: check keys schemas and check by queries in redis
//TODO: add default logo on server side and on client(this will be hardcoded if server side logo is not set), server side logo will be flexible if logo in metadata is not set
router.get("/api/multichain/naps", async (req, res) => {
  try {
    let result_naps = []
    const searchResults = await redis.call(
      "FT.SEARCH",
      "isVerifiedIndex",
      `@isVerified:{true}`
    );
    console.log(searchResults);

    if (searchResults[0] > 0) {
      const naps = searchResults.filter((item) => Array.isArray(item)).map((item) => JSON.parse(item[1]))
      result_naps = await populateNaps(naps)
    }

    res.json({ naps: result_naps });
  } catch (error) {
    console.error(error); //to right logging service
    res.status(500).json({ error: "Internal Server Error" }); //discuss about error status codes
  }
});

// FT.CREATE napCollectionAddressIndex ON JSON SCHEMA $.collectionAddress AS collectionAddress TAG
// FT.SEARCH napCollectionAddressIndex "@collectionAddress:{0xa42fd5d2f0a5d733917f718609501cf6105d085d}"
// FT.CREATE napCollectionAddressAndChainIndex ON JSON SCHEMA $.collectionAddress AS collectionAddress TAG $.chain AS chain TAG



async function searchByCollectionAddressAndChain(
  collectionAddress,
  chain,
  limit = 1,
  offset = 0
) {
  const searchResults = await redis.call(
    "FT.SEARCH",
    "napCollectionAddressAndChainIndex",
    `@collectionAddress:{${collectionAddress}} @chain:{${chain}}`,
    "LIMIT",
    `${offset}`,
    `${limit}`
  );

  console.log("Search Results:", searchResults);
  return searchResults;
}

router.get(
  "/api/:chain/nap_by_collection/:collectionAddress",
  async (req, res) => {
    try {
      const { chain } = req.params;
      let { collectionAddress } = req.params;
      collectionAddress = collectionAddress.toLowerCase();
      const searchResults = await searchByCollectionAddressAndChain(
        collectionAddress,
        chain
      );

      const nap = searchResults[0] > 0 ? searchResults[2][1] : null;

      if (!nap) {
        return res
          .status(404)
          .json({ success: false, message: "NAP not found" });
      }

      const parsedNap = JSON.parse(nap);
      const napId = parsedNap.id;
      let tokensToGetPrices = [];
      let tokensToGetPricesFromAPI = [];

      if (parsedNap?.assuranceToken?.id) {
        tokensToGetPrices.push({
          id: parsedNap.assuranceToken.id,
          token_key: "assuranceToken",
        });
        parsedNap.assuranceToken.price = {
          system_info: {
            success: false,
            chain: chain,
            address: parsedNap.assuranceToken.id,
            exchange: getExchangeForChain(chain),
          },
        };
      }

      if (parsedNap?.collateralToken?.id) {
        tokensToGetPrices.push({
          id: parsedNap.collateralToken.id,
          token_key: "collateralToken",
        });
        parsedNap.collateralToken.price = {
          system_info: {
            success: false,
            chain: chain,
            address: parsedNap.collateralToken.id,
            exchange: getExchangeForChain(chain),
          },
        };
      }
      for (const token of tokensToGetPrices) {
        const price = await redis.call(
          "JSON.GET",
          `prices:${chain}:ERC20:${token.id}`
        );
        if (price) {
          parsedNap[token.token_key].price = {
            ...parsedNap[token.token_key].price,
            ...JSON.parse(price),
          };
          parsedNap[token.token_key].price.system_info.success = true;
        } else {
          tokensToGetPricesFromAPI.push(token);
        }
      }

      console.log("tokensToGetPricesFromAPI", tokensToGetPricesFromAPI);
      console.log("tokensToGetPrices", tokensToGetPrices);
      if (tokensToGetPricesFromAPI.length > 0) {
        const prices = await fetchPricesFromAPI(
          tokensToGetPricesFromAPI.map((token) => ({
            token_address: token.id,
            exchange: getExchangeForChain(chain),
          })),
          chain
        );
        console.log("prices", prices);
        for (const price of prices) {
          await redis.call(
            "JSON.SET",
            `prices:${chain}:ERC20:${price.tokenAddress}`,
            "$",
            JSON.stringify(price)
          );
          await redis.call(
            "EXPIRE",
            `prices:${chain}:ERC20:${price.tokenAddress}`,
            60 * 60
          );
          const token = tokensToGetPricesFromAPI.find(
            (token) => token.id === price.tokenAddress
          );
          parsedNap[token.token_key].price = {
            ...parsedNap[token.token_key].price,
            ...price,
          };
        }
        parsedNap[token.token_key].price.system_info.success = true;
      }

      if (parsedNap?.assuranceToken?.id) {
        let assuranceTokenMetadata = await redis.call(
          "JSON.GET",
          `metadata:${chain}:ERC20:${parsedNap.assuranceToken.id}`
        );
        if (assuranceTokenMetadata) {
          assuranceTokenMetadata = JSON.parse(assuranceTokenMetadata);
        } else {
          const metadataFromAPI = await fetchTokenMetadataFromAPI(
            [parsedNap.assuranceToken.id],
            chain
          );
          assuranceTokenMetadata = metadataFromAPI[0];
          if (assuranceTokenMetadata) {
            await redis.call(
              "JSON.SET",
              `metadata:${chain}:ERC20:${parsedNap.assuranceToken.id}`,
              "$",
              JSON.stringify(assuranceTokenMetadata)
            );
          }
        }
        parsedNap.assuranceToken.metadata = assuranceTokenMetadata;
      }

      if (parsedNap?.collateralToken?.id) {
        let collateralTokenMetadata = await redis.call(
          "JSON.GET",
          `metadata:${chain}:ERC20:${parsedNap.collateralToken.id}`
        );
        if (collateralTokenMetadata) {
          collateralTokenMetadata = JSON.parse(collateralTokenMetadata);
        } else {
          const metadataFromAPI = await fetchTokenMetadataFromAPI(
            [parsedNap.collateralToken.id],
            chain
          );
          collateralTokenMetadata = metadataFromAPI[0];
          if (collateralTokenMetadata) {
            await redis.call(
              "JSON.SET",
              `metadata:${chain}:ERC20:${parsedNap.collateralToken.id}`,
              "$",
              JSON.stringify(collateralTokenMetadata)
            );
          }
        }
        parsedNap.collateralToken.metadata = collateralTokenMetadata;
      }

      if (parsedNap?.collectionAddress) {
        let collectionMetadata = await redis.call(
          "JSON.GET",
          `metadata:${chain}:COLLECTION:${parsedNap.collectionAddress}`
        );
        if (collectionMetadata) {
          collectionMetadata = JSON.parse(collectionMetadata);
        } else {
          const metadataFromAPI = await fetchCollectionMetadataFromAPI(
            [parsedNap.collectionAddress],
            chain
          );
          collectionMetadata = metadataFromAPI[0];
          if (collectionMetadata) {
            await redis.call(
              "JSON.SET",
              `metadata:${chain}:COLLECTION:${parsedNap.collectionAddress}`,
              "$",
              JSON.stringify(collectionMetadata)
            );
          }
        }
        parsedNap.collection_metadata = collectionMetadata;
      }
      parsedNap.totalVolumeInCollateral = null;
      //nap:totalVolumeInCollateral:<chain>:<napId>
      const totalVolumeInCollateral = await redis.call(
        "JSON.GET",
        `nap:totalVolumeInCollateral:${chain}:${napId}`
      );
      if (totalVolumeInCollateral) {
        parsedNap.totalVolumeInCollateral = JSON.parse(totalVolumeInCollateral);
      } else {
        let subgraphs_config = await redis.call(
          "JSON.GET",
          `config:graphql-queries:add-new-naps`
        );
        subgraphs_config = JSON.parse(subgraphs_config);
        if (subgraphs_config) {
          const services = subgraphs_config?.services;
          const service = parsedNap?.source_id
            ? services.find(
                (service) =>
                  service.chain === chain &&
                  service._id === parsedNap?.source_id
              )
            : services.find(
                (service) =>
                  service.chain === chain &&
                  service.source_type === parsedNap?.source_type
              );
          if (service) {
            const url = service.url;
            /**
           * query MyQuery {
  nap(id: "0x00aa5021954437fa5b5c89fbecfc5fe724bb4751") {
    totalVolumeInCollateral
           */
            const totalVolumeInCollateral = await getTotalVolumeInCollateral(
              napId,
              url
            );
            if (totalVolumeInCollateral) {
              parsedNap.totalVolumeInCollateral = totalVolumeInCollateral;
              await redis.call(
                "JSON.SET",
                `nap:totalVolumeInCollateral:${chain}:${napId}`,
                "$",
                JSON.stringify(totalVolumeInCollateral)
              );
              await redis.call(
                "EXPIRE",
                `nap:totalVolumeInCollateral:${chain}:${napId}`,
                60 * 60
              );
            }
          }
        }
      }

      res.json({ naps: [parsedNap] });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
);

async function getTotalVolumeInCollateral(napId, url) {
  const query = `
    query MyQuery {
      nap(id: "${napId}") {
        totalVolumeInCollateral
        id
      }
    }
  `;
  const response = await axios.post(url, {
    query,
    variables: {},
  });
  return response.data.data?.nap?.totalVolumeInCollateral;
}

//req.headers -- может содержать заголовки запроса юзера вместе с куки access_token & refresh_token

module.exports = router;