const tsMorphCommons = require('@ts-morph/common');

class YeomanFileSystem extends tsMorphCommons.RealFileSystemHost {
    generator;

    constructor(generator) {
        super();
        this.generator = generator;
    }

    async writeFile(filePath, fileText) {
        return this.writeFileSync(filePath, fileText);
    }

    writeFileSync(filePath, fileText) {
        return this.generator.fs.write(filePath, fileText);
    }
}

module.exports = {
    YeomanFileSystem
};
