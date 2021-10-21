const PORT = process.env.PORT || 8000;
const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");
const app = express();

const newspapers = [
  {
    name: "telegraph",
    address: "https://www.telegraphindia.com/sports/cricket",
    base: "http://www.telegraphindia.com",
  },
  {
    name: "theguardian",
    address: "https://www.theguardian.com/sport/cricket",
    base: "http://www.theguardian.com",
  },
  {
    name: "timesofindia",
    address: "https://timesofindia.indiatimes.com/sports/cricket",
    base: "http://timesofindia.indiatimes.com",
  },
  {
    name: "hindustantimes",
    address: "https://www.hindustantimes.com/cricket",
    base: "https://www.hindustantimes.com",
  },
  {
    name: "thesun",
    address: "https://www.thesun.co.uk/sport/cricket/",
    base: "https://www.thesun.co.uk",
  },
  {
    name: "dailymail",
    address: "https://www.dailymail.co.uk/sport/cricket/index.html",
    base: "https://www.dailymail.co.uk",
  },
];

const articles = [];

newspapers.forEach((newspaper) => {
  axios
    .get(newspaper.address)
    .then((response) => {
      const html = response.data;
      const $ = cheerio.load(html);

      $('a:contains("T20")', html).each(function () {
        const title = $(this).text();
        var url = $(this).attr("href");
        if (!url.startsWith("http://")) url = newspaper.base + url;

        articles.push({
          title,
          url,
          source: newspaper.name,
        });
      });
    })
    .catch((err) => console.log(err));
});

app.get("/", (req, res) => {
  res.json("Welcome to my T20 Cricket news API");
});

app.get("/news", (req, res) => {
  res.json(articles);
});

app.get("/news/:newspaperId", (req, res) => {
  const newspaperId = req.params.newspaperId;

  const newspaperAddress = newspapers.filter(
    (newspaper) => newspaper.name == newspaperId
  )[0].address;
  const newspaperBase = newspapers.filter(
    (newspaper) => newspaper.name == newspaperId
  )[0].base;

  axios
    .get(newspaperAddress)
    .then((response) => {
      const html = response.data;
      const $ = cheerio.load(html);
      const specifiedNewspaperArticles = [];

      $('a:contains("T20")', html).each(function () {
        const title = $(this).text();
        var url = $(this).attr("href");
        if (!url.startsWith("http://")) url = newspaperBase + url;

        specifiedNewspaperArticles.push({
          title,
          url,
          source: newspaperId,
        });
      });
      res.json(specifiedNewspaperArticles);
    })
    .catch((err) => {
      console.log(err);
    });
});

app.listen(PORT, () => {
  console.log(`Hello there! Server is running at ${PORT}`);
});
