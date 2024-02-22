

module.exports.generate_uuidv4=()=> {
    return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, c =>
      (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    );
  }
  

  module.exports.generate_id=()=> {
  return Math.floor(1000 + Math.random() * 9000)
  }
