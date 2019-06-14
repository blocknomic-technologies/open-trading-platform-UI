const axios = require('axios');

//Status Page Data Packet

class statusService {
  async getStatusUpdate() {
    return (await axios.get('https://bds.blocknomic.com/status-page-poller')).data;
  }
}

export default new statusService();
