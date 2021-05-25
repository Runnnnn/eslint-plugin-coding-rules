const CWD = process.cwd();

function relativePath(file) {
  return file.replace(CWD, '.');
}

module.exports = {
  relativePath,
};
