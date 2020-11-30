const SafeQMathMock = artifacts.require('SafeQMathMock')

module.exports = (deployer) => {
  deployer.deploy(SafeQMathMock)
}
