const CWD = process.cwd();

const IS_VSCODE = process.env.VSCODE_PID;

function relativePath(file) {
  return file.replace(CWD, '.');
}

module.exports = {
  relativePath,
  IS_VSCODE,
};
