
# Open Trading Platform - UI

Open Trading Platform is a Unified web application; meta trading platform for cryptocurrency Traders and Developers to run on your browser. It allows you to trade across 5 cryptocurrency exchanges for now:

  - Bitfinex (Spot trading)
  - Binance (Spot trading)
  - Bequant or HitBtc (Spot trading)
  - Bitmex(Margin trading)

The Open Trading Platform platform allows Traders to manage all their accounts on One Unified Secure platform completely in their control with the capabilities to add new features to the system. 

The Development is constantly maintained and updated by [Blocknomic Technologies Pvt. Ltd][blocknomic]

The open source system has been built keeping non-developers in mind to allow ease of startup.
You can test out the platform at https://trader.blocknomic.com

![Use Open Trading Platform UI to trade safely and efficiently ](https://lh3.googleusercontent.com/6xFt-fxZ1c1x_yDTOXrLE2UgU7B7iWxvK4h1jwdTtCkny_M1D_lLmeOi9RpVAbOBXOKiTJCKNDly "Open Trading Platfom UI")

# INDEX
  
  1. System architecture
  2. Getting Started
  3. Platform Features
  4. How to recommend Platform features to us?
  5. Developers, Contributors and how to contribute
  6. To-Do's
  7. Developer Note
  8. Roadmap (Coming soon)
  9. Wiki (Coming soon)
  10. Business Enquiries
  11. Donations
  12. Your security concerns!!!!

### System Architecture

The Open Trading platform has three main components

1. UI
2. API
3. ENGINE

The **UI** is available at [https://github.com/blocknomic-technologies/open-trading-platform-UI](https://github.com/blocknomic-technologies/open-trading-platform-UI) repository that contains all the code for the frontend which is displayed on browser. The **UI** requires both the **API** and the **ENGINE** to operate properly. 

The **API** available at [https://github.com/blocknomic-technologies/open-trading-platform-API](https://github.com/blocknomic-technologies/open-trading-platform-API) repository that contains all the platforms Api's and can work independantly from the other two components. It can be used by developers for programming their own system and function for automation.

The **ENGINE** is currently being run by us. It's a simple aggregator engine that complies all the different exchanges ticker/market data and displays it for users to use to choose their currency pair and comparing market rates etc. The **ENGINE** will be open sourced in future dates after cleaning up of the code. 

### Getting Started

The platform has been designed and built for two types of users Traders with no development experience and Traders/Developers with basic development experience below we will give you the different options to run the system. There are 3 ways to start the system.

 1. Head less (Easy)
 2. Full (Medium)
 3. Download (Easiest) - Coming soon

#### Head less (Download and run instructions for linux ubuntu)

Headless allows the developer to run the platform without running the UI on there computer. They can simply use https://trader.blocknomic.com to connect the server running on their computer.  This is perfect for people who don't have a powerful enough computer

##### Requirements

1. Node.js V8.9.0+
2. NPM
3. git

Download node.js and NPM at [https://nodejs.org/en/download/package-manager/](https://nodejs.org/en/download/package-manager/)


Download Git at [https://git-scm.com/downloads](https://git-scm.com/downloads)

##### Download and run
For Development environments...
  ```sh
$ git clone https://github.com/blocknomic-technologies/open-trading-platform-API.git
$ cd open-trading-platform-API
$ npm install
(In the root directory search and edit the keys.js file and input your API keys for the exchanges)
(To run simply type)
$ node debug.js
(open up https://trader.blocknomic.com) and see if you are connected. 
```

For Production environment (Coming soon)

#### Full (Download and run instructions for linux ubuntu)
Running the full system could get heavy that is why we recommend using Head Less. But if you are looking to overhaul the system and test out all the feature there are two main part to running her. 

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

### Platform Features

In this section we will explain all the available feature on the easy to use UI that we have made.

 1. Keyboard shortcuts
 2. View markets
 3. News
 4. Trezor integration
 5. Deposits
 6. Margin trading

You can also visit our youtube video to see how to use the entire system. (Coming soon)

You can do almost everything that you can on the exchanges directly on this platform. Below we will discuss in details everything that you can do with the UI. 

##### Keyboard Shortcuts
There is only one way to place a trade anywhere on the system by simply pressing
**alt+t** 
To view all open orders you simply press
**alt+o**

##### View markets
To select an exchange and a currency pair you have to visit markets on the navbar and choose your Exchange and currency pair there. 

##### News
We have incorporated a little news widget to allow you to view the latest news in the, we haven't completed programming it, but in the near future depending on the Currency pair you are on it will provide you relevant information regarding those coins for different new channels.

##### Trezor
To use your trezor directly on the platform, use the navbar on the top, go to profile->Setting and connect your trezor. More info available on the WIKI. (Coming soon)

##### Deposit
You can get wallet address directly from the UI by going funds on the navbar and then wallet and choosing the exchange and currency. We do not allow withdrawls from the system for security reasons.

##### Margin trading
Go to the markets page and choose margin trading. More info available on the WIKI and youtube. (Coming soon)

### How to recommend Platform features to us?

- If you are a developer you can follow the instructions on the WIKI page. 
- If you are a trader you can drop us an email at features@blocknomic.com if we get enough inquiries regarding the update we will look into it. 
- If you are in need for a feature and can't wait you can get in touch with our Business development team to have your custom feature built enquiry@blocknomic.com

### Developers, Contributors and how to contribute

| Developer |  |
| ------ | ------ |
| Hargun singh | Project manager |
| Lovish wadhera | Sr Full stack Developer |
| Mayank bhardwaj | Minion Full stack Developer |

| Contributors |  |
| ------ | ------ |
| Ayush Gupta | Full stack developer |

Want to contribute? Great!

Please go to the wiki link and follow all the instructions to help with development of the Open Trading Platform

### Todos

 - Clean code
 - Add documentation (Swagger & JsDocs)
 - Finish up wiki 
 - Complete all coming soon agendas

#### Developer note

This is our first open source project please bear with us as we navigate through this experience and try to make it as comfortable as an experience for you. 

#### Business Enquiry

For any customisation or cloud setup of your system please email us at enquiry@blocknomic.com

#### Donations

We accept crypto donations if you're looking to fund our teams Beers, Pizza's and Butter chicken.

BTC = 3N1eMLHky6mTYLLtN4QfzecWduakVYgdVa

LTC = MSnYXgutFWYmmfet9saYGMy66MFuiRYq1y

#### Your Security Concerns

Nothing is stored on a database and all your apikeys are safely stored on your local computer. All http requests are taken care of from the server running on your computer. 

License
----

GNU AGPLv3


**Free Software, We hope you enjoy it!**

[//]: # (These are reference links used in the body of this note and get stripped out when the markdown processor does its job. There is no need to format nicely because it shouldn't be seen. Thanks SO - http://stackoverflow.com/questions/4823468/store-comments-in-markdown-syntax)

   [blocknomic]: <http://blocknomic.com>

