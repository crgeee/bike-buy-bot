const ck = require("ckey");
const puppeteer = require("puppeteer-extra");
const pluginStealth = require("puppeteer-extra-plugin-stealth");
const { installMouseHelper } = require("./extras/mouse-helper");
const fs = require("fs");
const SimpleNodeLogger = require("simple-node-logger");
const parseBoolean = require("parse-string-boolean");

puppeteer.use(pluginStealth());

// Logging
let html = "";
const html_path = "htmls/bot_";
const screenshot_path = "screenshots/bot_";
const opts = {
  logFilePath: "logs/" + "bot.log",
  timestampFormat: "YYYY-MM-DD HH:mm:ss.SSS",
};
const log = SimpleNodeLogger.createSimpleLogger(opts);
log.setLevel(ck.LOG_LEVEL);

// Includes writing updates to log file, writing html snapshots, and taking screenshots
const debug = parseBoolean(ck.DEBUG, false);

// Urls
const url =
  parseBoolean(ck.USE_TEST_URL, false) === true ? ck.TEST_URL : ck.URL;

// Main flow
(async () => {
  const browser = await puppeteer.launch({
    headless: false,
  });
  let count = 0;

  try {
    const page = await browser.newPage();

    if (debug == true) {
      await installMouseHelper(page); // Makes mouse visible

      var dir = "./htmls";
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
      }
      dir = "./screenshots";
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
      }
      dir = "./logs";
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
      }
    }

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
      await page.goto(ck.LOGIN_URL),
    ]);

    log.debug(`step ${count++}: #js-addToCart-Container`);

    // Enter username
    await page.waitForSelector(".accountForm > #login-form #loginEmail");
    await page.click(".accountForm > #login-form #loginEmail");
    await page.type("#loginEmail", ck.USERNAME);

    log.debug(`step ${count++}: loginEmail`);

    await page.waitForTimeout(500);

    // Enter password
    await page.waitForSelector(".accountForm > #login-form #loginPassword");
    await page.click(".accountForm > #login-form #loginPassword");
    await page.type("#loginPassword", ck.PASSWORD);

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
    await page.goto(ck.CHECKOUT_URL);

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
      ck.CC_NAME
    );

    await page.waitForTimeout(500);

    log.debug(`step ${count++}: dwfrm_billing_creditCardFields_cardOwner`);

    await page.waitForSelector(
      "input[name=dwfrm_billing_creditCardFields_cardNumber]"
    );
    await page.type(
      "input[name=dwfrm_billing_creditCardFields_cardNumber]",
      ck.CC_NUM
    );

    await page.waitForTimeout(500);

    log.debug(`step ${count++}: dwfrm_billing_creditCardFields_cardNumber`);

    await page.waitForSelector(
      "input[name=dwfrm_billing_creditCardFields_securityCode]"
    );
    await page.type(
      "input[name=dwfrm_billing_creditCardFields_securityCode]",
      ck.CC_CVC
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
    }, ck.CC_EXP_MO);

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
    }, ck.CC_EXP_YR);

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

    if (parseBoolean(ck.BUY, false) === false) {
      // send an email
      log.info("BUY is false...closing");
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
  } catch (error) {
    // send an email
    log.error(error);
  } finally {
    await browser.close();
  }
})();
