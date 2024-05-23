require("dotenv").config();

const { notarize } = require("@electron/notarize");

exports.default = async function notarizing() {
  try {
    await notarize({
      appleId: "test.wecode.inc@gmail.com",
      appleIdPassword: "frmb-fxzz-lkmt-suxc",
      teamId: "G6G549CHCQ",
      appBundleId:"com.devservices.mrxbet",
    });
    console.log("Notarization successful!");
  } catch (error) {
    console.error("Notarization failed:", error);
  }
};
