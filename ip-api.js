const rp = require('request-promise');
const ip = require('ip');

/**
 * Uses ip-api.com's free API to fetch IP info such as country, city, org, asn, etc...
 * @return {Promise<{}|Boolean>} IP Info if successful, False if not
 */
exports.getIpInfo = async function(ipAddress) {
  try {
    if (ip.isPrivate(ipAddress)) {
      // This IP is on the same intranet, default to getting the info from the host's external IP
      // If you don't specify an IP, the API will return info for the caller's IP
      ipAddress = '';
    }

    const info = await rp({
      uri: `http://ip-api.com/json/${ipAddress}`,
      json: true,
    });
    return info;
  } catch (e) {
    console.error(e);
    return false;
  }
};
