const puppeteer = require("puppeteer-extra");
const pluginStealth = require("puppeteer-extra-plugin-stealth");
const { installMouseHelper } = require("./extras/mouse-helper");
const fs = require("fs").promises;
const SimpleNodeLogger = require("simple-node-logger");
const parseBoolean = require("parse-string-boolean");
const { parseISO, compareAsc } = require("date-fns");
const nodemailer = require("nodemailer");
const sgTransport = require("nodemailer-sendgrid-transport");

if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

// Setup Puppeteer
puppeteer.use(pluginStealth());

// Constants
let PURCHASE_MADE = false;
let FATAL_ERROR_COUNT = 0;
let ACTIVELY_RUNNING = false;

// Logging
let log;
const loggingOptions = {
  // logFilePath: "bot.log",
  timestampFormat: "YYYY-MM-DD HH:mm:ss.SSS",
};

// Email
const emailOptions = {
  auth: {
    api_key: process.env.SENDGRID_API_KEY,
  },
};
const client = nodemailer.createTransport(sgTransport(emailOptions));

// Send email
const sendEmail = (subject, text) => {
  if (!parseBoolean(process.env.EMAIL_ENABLED, false)) return;

  const email = {
    subject,
    text,
    to: process.env.EMAIL_TO,
    from: process.env.EMAIL_FROM,
  };
  client.sendMail(email, function (err, info) {
    if (err) {
      log.error(err);
    } else {
      log.info("Email sent: " + JSON.stringify(info));
    }
  });
};

async function mainFlow() {
  ACTIVELY_RUNNING = true;
  const browser = await puppeteer.launch({
    headless: false,
    args: ["--no-sandbox"],
  });
  let count = 0;

  try {
    const page = await browser.newPage();

    if (parseBoolean(process.env.DEBUG, false) == true) {
      await installMouseHelper(page); // Makes mouse visible
    }

    const url =
      parseBoolean(process.env.USE_TEST_URL, false) === true
        ? process.env.TEST_URL
        : process.env.URL;

    await page.goto(url);

    log.debug(`step ${count++}: goto url`);

    // dumb privacy modal
    await page.click("button#js-data-privacy-save-button");

    log.debug(`step ${count++}: button#js-data-privacy-save-button`);

    // add to cart btn on page
    try {
      // data-gtm-label="Add to cart"?
      await page.waitForSelector(
        "#js-addToCart-Container > .productDescription__buttonsWrapper > #js-productDetailBuyButton > .button > .productDescription__addToCartText"
      );
    } catch (error) {
      // after 30 seconds, it couldn't find anything
      log.info("couldn't add to cart. it's not available!");
      return;
    }

    log.debug(`step ${count++}: #js-addToCart-Container`);

    await Promise.all([
      await page.click(
        "#js-addToCart-Container > .productDescription__buttonsWrapper > #js-productDetailBuyButton > .button > .productDescription__addToCartText"
      ),
      // login
      await page.goto(process.env.LOGIN_URL),
    ]);

    log.debug(`step ${count++}: #js-addToCart-Container`);

    // Enter username
    await page.waitForSelector(".accountForm > #login-form #loginEmail");
    await page.click(".accountForm > #login-form #loginEmail");
    await page.type("#loginEmail", process.env.CANYON_USERNAME);

    log.debug(`step ${count++}: loginEmail`);

    await page.waitForTimeout(500);

    // Enter password
    await page.waitForSelector(".accountForm > #login-form #loginPassword");
    await page.click(".accountForm > #login-form #loginPassword");
    await page.type("#loginPassword", process.env.CANYON_PASSWORD);

    log.debug(`step ${count++}: loginPassword`);

    await page.waitForTimeout(500);

    await page.waitForSelector(
      ".mainContent > .accountAdminPage__row > .accountForm > #login-form > .button"
    );

    log.debug(`step ${count++}: .mainContent`);

    // Click Submit
    await Promise.all([
      page.click(
        ".mainContent > .accountAdminPage__row > .accountForm > #login-form > .button"
      ),
      page.waitForNavigation({ waitUntil: "networkidle0" }),
    ]);

    log.debug(`step ${count++}: networkidle0`);

    // Go to checkout
    await page.goto(process.env.CHECKOUT_URL);

    log.debug(`step ${count++}: CHECKOUT_URL`);

    await page.waitForSelector(
      "#dwfrm_shipping > .checkoutFormStep__submitButtonWrapper > .checkoutFormStep__submitButtonInner > .checkoutFormStep__submitButtonContent > .button"
    );
    await page.click(
      "#dwfrm_shipping > .checkoutFormStep__submitButtonWrapper > .checkoutFormStep__submitButtonInner > .checkoutFormStep__submitButtonContent > .button"
    );

    log.debug(`step ${count++}: #dwfrm_shipping`);

    await page.waitForSelector(
      ".shipping-method-list > .checkoutFormStep__inputWrapper:nth-child(1) > .form-check > .form-check-label > .inputRadio__labelText"
    );
    await page.click(
      ".shipping-method-list > .checkoutFormStep__inputWrapper:nth-child(1) > .form-check > .form-check-label > .inputRadio__labelText"
    );

    log.debug(`step ${count++}: .shipping-method-list`);

    await page.waitForSelector(
      ".checkoutFormStep__submitButtonWrapper > .checkoutFormStep__submitButtonInner > .checkoutFormStep__submitButtonContent > .js-disabled-error > .button"
    );
    await page.click(
      ".checkoutFormStep__submitButtonWrapper > .checkoutFormStep__submitButtonInner > .checkoutFormStep__submitButtonContent > .js-disabled-error > .button"
    );

    log.debug(`step ${count++}: checkoutFormStep__submitButtonWrapper`);

    await page.waitForSelector(
      ".checkoutFormStep__submitButtonWrapper > .checkoutFormStep__submitButtonInner > .checkoutFormStep__submitButtonContent > .js-disabled-error > .button"
    );
    await page.click(
      ".checkoutFormStep__submitButtonWrapper > .checkoutFormStep__submitButtonInner > .checkoutFormStep__submitButtonContent > .js-disabled-error > .button"
    );

    log.debug(`step ${count++}: checkoutFormStep__submitButtonWrapper`);

    await page.waitForSelector(
      ".checkoutFormStep__submitButtonWrapper > .checkoutFormStep__submitButtonInner > .checkoutFormStep__submitButtonContent > .js-disabled-error > .button"
    );
    await page.click(
      ".checkoutFormStep__submitButtonWrapper > .checkoutFormStep__submitButtonInner > .checkoutFormStep__submitButtonContent > .js-disabled-error > .button"
    );

    log.debug(`step ${count++}: checkoutFormStep__submitButtonWrapper`);

    await page.waitForTimeout(10000);

    // shipping
    await page.waitForSelector(
      ".checkoutFormStep__submitButtonWrapper > .checkoutFormStep__submitButtonInner > .checkoutFormStep__submitButtonContent > .js-disabled-error > .button"
    );
    await page.click(
      ".checkoutFormStep__submitButtonWrapper > .checkoutFormStep__submitButtonInner > .checkoutFormStep__submitButtonContent > .js-disabled-error > .button"
    );

    log.debug(`step ${count++}: .checkoutFormStep__submitButtonWrapper`);

    await page.waitForTimeout(10000);

    // continue
    await page.waitForSelector(
      "button.button--primary.checkoutFormStep__submitButton.submit-shipping.next-step-extra-validation.xlt-continueCheckout"
    );
    await page.click(
      "button.button--primary.checkoutFormStep__submitButton.submit-shipping.next-step-extra-validation.xlt-continueCheckout"
    );

    log.debug(`step ${count++}: button.button--primary.checkoutFormStep`);

    await page.waitForTimeout(20000);

    // enter CC info
    await page.waitForSelector(
      "input[name=dwfrm_billing_creditCardFields_cardOwner]"
    );
    await page.type(
      "input[name=dwfrm_billing_creditCardFields_cardOwner]",
      process.env.CC_NAME
    );

    await page.waitForTimeout(500);

    log.debug(`step ${count++}: dwfrm_billing_creditCardFields_cardOwner`);

    await page.waitForSelector(
      "input[name=dwfrm_billing_creditCardFields_cardNumber]"
    );
    await page.type(
      "input[name=dwfrm_billing_creditCardFields_cardNumber]",
      process.env.CC_NUM
    );

    await page.waitForTimeout(500);

    log.debug(`step ${count++}: dwfrm_billing_creditCardFields_cardNumber`);

    await page.waitForSelector(
      "input[name=dwfrm_billing_creditCardFields_securityCode]"
    );
    await page.type(
      "input[name=dwfrm_billing_creditCardFields_securityCode]",
      process.env.CC_CVC
    );

    await page.waitForTimeout(500);

    log.debug(`step ${count++}: dwfrm_billing_creditCardFields_securityCode`);

    await page.evaluate((expMo) => {
      const select = document.querySelector(
        "#dwfrm_billing_creditCardFields_expirationMonth"
      );
      const options = select.querySelectorAll("option");
      const selectedOption = [...options].find(
        (option) => option.text === expMo
      );

      selectedOption.selected = true;
    }, process.env.CC_EXP_MO);

    log.debug(
      `step ${count++}: dwfrm_billing_creditCardFields_expirationMonth`
    );

    await page.waitForTimeout(500);

    await page.evaluate((expMo) => {
      const select = document.querySelector(
        "#dwfrm_billing_creditCardFields_expirationYear"
      );
      const options = select.querySelectorAll("option");
      const selectedOption = [...options].find(
        (option) => option.text === expMo
      );

      selectedOption.selected = true;
    }, process.env.CC_EXP_YR);

    log.debug(`step ${count++}: dwfrm_billing_creditCardFields_expirationYear`);

    await page.waitForSelector(
      "button.button--primary.checkoutFormStep__submitButton.submit-payment.xlt-continueCheckout"
    );
    await page.click(
      "button.button--primary.checkoutFormStep__submitButton.submit-payment.xlt-continueCheckout"
    );

    log.debug(`step ${count++}: .xlt-continueCheckout`);

    await page.waitForTimeout(20000);

    await page.waitForSelector("#order-review-agreement");
    await page.click("#order-review-agreement");

    log.debug(`step ${count++}: #order-review-agreement`);

    if (parseBoolean(process.env.BUY, false) === false) {
      // send an email
      log.info("BUY is FALSE!! canceling order");

      // send an email
      sendEmail("bike-bot CANCELLED!", "BUY is FALSE ;)");
      return;
    }

    log.debug(`step ${count++}: parseBoolean`);

    await page.waitForSelector(
      "button.button--primary.button--link.cartOrderSummary__button.place-order.xlt-continueCheckout"
    );
    await page.click(
      "button.button--primary.button--link.cartOrderSummary__button.place-order.xlt-continueCheckout"
    );

    await page.waitForTimeout(50000);

    log.info(
      "Reached the end of the flow!! Hopefully my purchase went well ;)"
    );

    PURCHASE_MADE = true;

    // send an email
    sendEmail(
      "bike-bot PURCHASED!",
      "Congrats on your new bike, Christopher ;)"
    );
  } catch (error) {
    FATAL_ERROR_COUNT++;

    // send an email
    sendEmail("bike-bot ERROR", error);

    log.error(error);
  } finally {
    ACTIVELY_RUNNING = false;
    await browser.close();
  }
}

async function initLogging() {
  try {
    log = SimpleNodeLogger.createSimpleLogger(loggingOptions);
    log.setLevel(process.env.LOG_LEVEL);
  } catch (error) {
    console.error(error);
  }
}

// Main flow
(async () => {
  await initLogging();

  log.info("starting mainFlow");

  const intervalTime = parseBoolean(process.env.DEBUG, false)
    ? parseInt(process.env.DEBUG_INTERVAL_TIME, 10)
    : parseInt(process.env.INTERVAL_TIME, 10);
  const timerId = setInterval(async () => {
    // check if the flow is already running
    if (ACTIVELY_RUNNING) {
      log.debug("actively running already!");
      return;
    }

    // check if already purchased or error, and disable
    const configExpirationDate = parseISO(process.env.EXPIRATION_DATE);
    const dateCompare = compareAsc(Date.now(), configExpirationDate);
    if (
      PURCHASE_MADE ||
      FATAL_ERROR_COUNT > parseInt(process.env.FATAL_ERROR_THRESHOLD, 10) ||
      dateCompare > 0
    ) {
      log.info(
        `disabling interval -- PURCHASE_MADE: ${PURCHASE_MADE} -- dateCompare: ${dateCompare} -- FATAL_ERROR_COUNT: ${FATAL_ERROR_COUNT} -- configExpirationDate: ${configExpirationDate}`
      );
      clearInterval(timerId);

      // send an email
      sendEmail(
        "bike-bot DISABLED!",
        `Hopefully for a good reason ;) PURCHASE_MADE: ${PURCHASE_MADE} -- dateCompare: ${dateCompare} -- FATAL_ERROR_COUNT: ${FATAL_ERROR_COUNT} -- configExpirationDate: ${configExpirationDate}`
      );
      return;
    }
    log.debug("calling mainFlow");
    log.debug(
      `PURCHASE_MADE: ${PURCHASE_MADE} -- dateCompare: ${dateCompare} -- FATAL_ERROR_COUNT: ${FATAL_ERROR_COUNT} -- configExpirationDate: ${configExpirationDate}`
    );

    if (parseBoolean(process.env.DEBUG, false)) {
      sendEmail(
        "bike-bot DEBUG!",
        `Hopefully for a good reason ;) PURCHASE_MADE: ${PURCHASE_MADE} -- dateCompare: ${dateCompare} -- FATAL_ERROR_COUNT: ${FATAL_ERROR_COUNT} -- configExpirationDate: ${configExpirationDate}`
      );
    }

    await mainFlow();
  }, intervalTime);
})();
