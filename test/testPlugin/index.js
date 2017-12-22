module.exports = {
  name: 'testPlugin',
  register: {
    'requestInMaster': (socket, los) => {
      console.log("plugin exec");
    }
  }
}