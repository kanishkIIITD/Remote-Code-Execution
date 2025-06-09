const ensureImageExists = async (docker, image) => {
  try {
    const imageExists = await docker.getImage(image).inspect();
    if (imageExists) {
      return;
    }
  } catch (e) {
    console.log(`Image ${image} not found, pulling...`);
  }

  // Pull the image if it doesn't exist locally
  return new Promise((resolve, reject) => {
    docker.pull(image, (err, stream) => {
      if (err) return reject(new Error(`Image pull failed for ${image}: ${err.message || err}`));
      docker.modem.followProgress(stream, (err, res) =>
        err ? reject(new Error(`Image pull failed for ${image}: ${err.message || err}`)) : resolve(res)
      );
    });
  });
};

module.exports = ensureImageExists;
