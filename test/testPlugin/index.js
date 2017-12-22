module.exports = {
  info: {
    name: 'testPlugin',
    version: '0.0.1'
  },
  register: bind => {

    bind('requestInMaster', (socket, los, resolve) => {
      console.log("testPlugin");
    });

  }
}