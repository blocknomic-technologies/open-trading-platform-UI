
# Open Trading Platform - UI
Open Trading Platform is a Unified web application; meta trading platform for cryptocurrency Traders and Developers to run on your browser. It allows you to trade across 5 cryptocurrency exchanges for now:

  - Bitfinex (Spot trading)
  - Binance (Spot trading)
  - Bequant or HitBtc (Spot trading)
  - Bitmex(Margin trading)

The Open Trading Platform platform allows Traders to manage all their accounts on One Unified Secure platform completely in their control with the capabilities to add new features to the system. 

The Development is constantly maintained and updated by [Blocknomic Technologies Pvt. Ltd][blocknomic]

The open source system has been built keeping non-developers in mind to allow ease of startup.
You can test out the platform at https://trader.opentradingplatform.org

![Use Open Trading Platform UI to trade safely and efficiently ](https://lh3.googleusercontent.com/6xFt-fxZ1c1x_yDTOXrLE2UgU7B7iWxvK4h1jwdTtCkny_M1D_lLmeOi9RpVAbOBXOKiTJCKNDly "Open Trading Platfom UI")

# INDEX
  
  1. [System architecture](#system-architecture)
  2. [Getting Started](#getting-started)
  3. [Platform Features](#platform-features)
  4. [How to recommend Platform features to us?](#how-to-recommend-platform-features-to-us)
  5. [Developers, Contributors and how to contribute](#developers-contributors-and-how-to-contribute)
  6. [Todos](#todos)
  7. [Developer Note](#developer-note)
  8. [Roadmap](#roadmap)
  9. [Wiki][wiki]
  10. Documentation (Coming soon) 
  11. [Donations](#donations)
  12. [Your security concerns!!!!](#your-security-concerns)

## System Architecture

The Open Trading platform has three main components

1. UI
2. API
3. ENGINE
4. TradingView widgets

The **UI** is available at [https://github.com/blocknomic-technologies/open-trading-platform-UI](https://github.com/blocknomic-technologies/open-trading-platform-UI) repository that contains all the code for the frontend which is displayed on browser. The **UI** requires both the **API** and the **ENGINE** to operate properly. 

The **API** available at [https://github.com/blocknomic-technologies/open-trading-platform-API](https://github.com/blocknomic-technologies/open-trading-platform-API) repository that contains all the platforms Api's and can work independantly from the other two components. It can be used by developers for programming their own system and function for automation.

The **ENGINE** is currently being run by us. It's a simple aggregator engine that complies all the different exchanges ticker/market data and displays it for users to use to choose their currency pair and comparing market rates etc. The **ENGINE** will be open sourced in future dates after cleaning up of the code. 

The **TRADING VIEW WIDGETS** are also currently being run by us. If you wish to run it on your own follow the instruction on https://github.com/blocknomic-technologies/open-trading-platform-TradingView/blob/master/README.md 

## Getting Started

The platform has been designed and built for two types of users Traders with no development experience and Traders/Developers with basic development experience below we will give you the different options to run the system. There are 3 ways to start the system.

 1. [Headless (Easy)](#headless)
 2. [Full (Medium)](#full)
 3. [Download (Easiest)](#download)

### Headless

Headless allows the developer to run the platform without running the UI on there computer. They can simply use https://trader.opentradingplatform.org to connect the server running on their computer. 

#### Requirements

1. Node.js V8.9.0+
2. NPM
3. git

Download node.js and NPM at [https://nodejs.org/en/download/package-manager/](https://nodejs.org/en/download/package-manager/)

Download Git at [https://git-scm.com/downloads](https://git-scm.com/downloads)

For Development environments...
  ```sh
$ git clone https://github.com/blocknomic-technologies/open-trading-platform-API.git
$ cd open-trading-platform-API
$ npm install
(In the root directory search and edit the keys.js file and input your API keys for the exchanges)
(To run simply type)
$ node debug.js
(open up https://trader.opentradingplatform.org) and see if you are connected. 
```

For Production environment (Coming soon)

### Full
Running the full system could get heavy that is why we recommend using Head Less. But if you are looking to overhaul the system and test out all the feature there are two main part to running it. 

##### Requirements

1. Node.js V8.9.0+
2. NPM
3. Vue.js V2.5.13+ ( Have not tested in later version, but shouldn't be an issue)
4. Git

Download node.js and NPM at [https://nodejs.org/en/download/package-manager/](https://nodejs.org/en/download/package-manager/)


Download Git at [https://git-scm.com/downloads](https://git-scm.com/downloads)

For Development environments...
  ```sh
$ git clone https://github.com/blocknomic-technologies/open-trading-platform-API.git
$ cd open-trading-platform-API
$ npm install
(In the root directory search for the keys.js file and input your API keys for the exchanges)
(To run simply type)
$ node debug.js
```

after downloading and running the server get out of the API root directory and follow the below instructions to run the UI. 

  ```sh
$ git clone https://github.com/blocknomic-technologies/open-trading-platform-UI.git
$ cd open-trading-platform-UI
$ npm install
$ npm run serve
```

Within the terminal you will be given a link http://localhost.... open the link and trade

For Production environment (Coming soon)

### Download

Easiest way to run the system, perfect for traders/non-developers.
visit https://opentradingplatform.org/trader.html

## Platform Features

In this section we will explain all the available feature on the easy to use UI that we have made.

 1. [Keyboard shortcuts](#keyboard-shortcuts)
 2. [View markets](#view-markets)
 3. [News](#news)
 4. [Trezor integration](#trezor)
 5. [Deposits](#deposits)
 6. [Margin trading](#margin-trading)
 7. [Server status](#server-status)

You can also visit our youtube video to see how to use the entire system. (Coming soon)

You can do almost everything that you can on the exchanges directly on this platform. Below we will discuss in details everything that you can do with the UI. 

#### Keyboard Shortcuts
There is only one way to place a trade anywhere on the system by simply pressing
**alt+t** 
To view all open orders you simply press
**alt+o**

![enter image description here](https://lh3.googleusercontent.com/GtqCk8wU1pImcq5HFMGryYDe6MQ6YpIlwaQgdjr3X436fWrND0v798YTsQtiI-Hu43YmAaSyOh6P "Keyboard shortcuts")

#### View markets
To select an exchange and a currency pair you have to visit markets on the navbar and choose your Exchange and currency pair there. 


![Choosing your currency](https://lh3.googleusercontent.com/2gb3ZhF8bgIfcf7szRAa4F4j0ropkQsA6qL3SroL_sq2nXPPM7bb5lD0dOgc1OS31dVOeJscEvfb "Market")

#### News
We have incorporated a little news widget to allow you to view the latest news in the, we haven't completed programming it, but in the near future depending on the Currency pair you are on it will provide you relevant information regarding those coins for different new channels.


![enter image description here](https://lh3.googleusercontent.com/ueTxModFb3EUZ1at-5rH9GtO275BvXZHEJ1d1KYJ9vWaKf-_rmn77hcaFOSZcLgPRrE559wS25vz "News")

#### Trezor
To use your trezor directly on the platform, use the navbar on the top, go to profile->Setting and connect your trezor. More info available on the WIKI. (Coming soon)

#### Deposit
You can get wallet address directly from the UI by going funds on the navbar and then wallet and choosing the exchange and currency. We do not allow withdrawls from the system for security reasons.

![
](https://lh3.googleusercontent.com/FtfUrECoPdBeazCR-VCEk8KhiCA5_UBocjSnx_P3kRhWVWFLRfJYtfMV4sb0WBcbEvAotMQK1dQY "Deposits")
#### Margin trading
Go to the markets page and choose Derivatives market at the bottom.


![
](https://lh3.googleusercontent.com/9TbBOqA0_FA-dmus1bTKcwzwJd9UPM3GzR6g89CscAjguapq8qglc5h9k2-ZeKy5AZVP1iUpkNUW "Margin trading")

#### Server status
On the top right of the nav bar there is a status bar that allows you to see if your local server is on or not. Green means connected, Orange means NOT connected.


![
](https://lh3.googleusercontent.com/Fg-XhR9o5uKv2XlPzg38H9Mc4L-gcPLllm8sq0fkJqNsNTCt6i_8OdsM-UOz3DTAVy5DL_HwPmjn "Server status")

FOR MORE DETAILS ON PLATFORM FEATURES PLEASE VISIT THE [WIKI][wiki]

## How to recommend Platform features to us?

- Just visit the issues tab on this github rep and choose the feature template. 

## Developers, Contributors and how to contribute

| Developer |  |
| ------ | ------ |
| Hargun singh | Project manager |
| Lovish wadhera | Sr Full stack Developer |
| Mayank bhardwaj | Minion Full stack Developer |

| Contributors |  |
| ------ | ------ |
| Ayush Gupta | Full stack developer |

Want to contribute? Great!
We'll be adding guidelines soon.

## Todos

 - Clean code
 - Add documentation (Swagger & JsDocs)
 - Finish up wiki 
 - Complete all coming soon agendas

## Developer note

This is our first open source project please bear with us as we navigate through this experience and try to make it as comfortable as an experience for you. 

## Roadmap

![enter image description here](https://lh3.googleusercontent.com/TuQzTUmKm3g17d85wqCu3uCT5a-nIw0_LT9zXcGji9qtIXNq8BNKbW6aMvs-CHe1iTw-NR05sCGQ "Roadmap")
## Donations

We accept crypto donations if you're looking to fund our teams Beers, Pizza's and Butter chicken.

BTC = 3N1eMLHky6mTYLLtN4QfzecWduakVYgdVa

LTC = MSnYXgutFWYmmfet9saYGMy66MFuiRYq1y

## Your Security Concerns

Nothing is stored on a database and all your apikeys are safely stored on your local computer. All http requests are taken care of from the server running on your computer. 

License
----

GNU AGPLv3


**Free Software, We hope you enjoy it!**

[//]: # (These are reference links used in the body of this note and get stripped out when the markdown processor does its job. There is no need to format nicely because it shouldn't be seen. Thanks SO - http://stackoverflow.com/questions/4823468/store-comments-in-markdown-syntax)

   [blocknomic]: <http://blocknomic.com>
   [wiki]: <https://github.com/blocknomic-technologies/open-trading-platform-UI/wiki>

