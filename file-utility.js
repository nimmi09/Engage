const fs = require("fs");

class file_utility {
  static movefile(image_path) {
    let pathparts = image_path.split("\\");
    let filename = pathparts[pathparts.length - 1];
    const destinationPath =
      "C:/Users/namra/OneDrive/Desktop/Engage/uploads/permanent" +
      "/" +
      filename;

    fs.rename(image_path, destinationPath, function (err) {
      if (err) {
        throw err;
      }
    });
    console.log(destinationPath);
    return destinationPath;
  }
  static deletefile(images) {
    for (let i = 0; i < images; i++) {
      image_path = images[i].path;

      fs.unlinkSync(image_path, (err) => {
        if (err) console.log(err);
      });
    }
  }
}
module.exports = { file_utility };
