const fs = require('fs');
const path = require('path');
const JavaScriptObfuscator = require('javascript-obfuscator');
const CleanCSS = require('clean-css');

// Configuración de rutas
const SRC_DIR = path.join(__dirname, 'src');
const DIST_DIR = __dirname; // La raíz del proyecto

// Crear carpetas de destino si no existen (ya deberían existir pero por si acaso)
if (!fs.existsSync(path.join(DIST_DIR, 'js'))) fs.mkdirSync(path.join(DIST_DIR, 'js'));
if (!fs.existsSync(path.join(DIST_DIR, 'css'))) fs.mkdirSync(path.join(DIST_DIR, 'css'));

// 1. Ofuscar JavaScript
const jsFiles = ['i18n.js', 'main.js'];
const obfuscatorOptions = {
    compact: true,
    controlFlowFlattening: true,
    controlFlowFlatteningThreshold: 0.75,
    deadCodeInjection: true,
    deadCodeInjectionThreshold: 0.4,
    debugProtection: true, // Evita que usen DevTools facilmente
    debugProtectionInterval: 2000,
    disableConsoleOutput: true, // Bloquea los console.log
    identifierNamesGenerator: 'hexadecimal',
    log: false,
    numbersToExpressions: true,
    renameGlobals: false,
    selfDefending: true,
    simplify: true,
    splitStrings: true,
    splitStringsChunkLength: 10,
    stringArray: true,
    stringArrayCallsTransform: true,
    stringArrayCallsTransformThreshold: 0.5,
    stringArrayEncoding: ['base64', 'rc4'],
    stringArrayIndexShift: true,
    stringArrayRotate: true,
    stringArrayShuffle: true,
    stringArrayWrappersCount: 1,
    stringArrayWrappersChainedCalls: true,
    stringArrayWrappersParametersMaxCount: 2,
    stringArrayWrappersType: 'variable',
    stringArrayThreshold: 0.75,
    unicodeEscapeSequence: false
};

jsFiles.forEach(file => {
    const srcPath = path.join(SRC_DIR, 'js', file);
    const distPath = path.join(DIST_DIR, 'js', file);
    
    if (fs.existsSync(srcPath)) {
        const code = fs.readFileSync(srcPath, 'utf8');
        console.log(`[JS] Obfuscating ${file}...`);
        const obfuscationResult = JavaScriptObfuscator.obfuscate(code, obfuscatorOptions);
        fs.writeFileSync(distPath, obfuscationResult.getObfuscatedCode());
        console.log(`[JS] Saved obfuscated ${file}`);
    }
});

// 2. Minificar CSS
const cssFiles = ['style.css'];
cssFiles.forEach(file => {
    const srcPath = path.join(SRC_DIR, 'css', file);
    const distPath = path.join(DIST_DIR, 'css', file);
    
    if (fs.existsSync(srcPath)) {
        const cssCode = fs.readFileSync(srcPath, 'utf8');
        console.log(`[CSS] Minifying ${file}...`);
        const output = new CleanCSS({ level: 2 }).minify(cssCode);
        fs.writeFileSync(distPath, output.styles);
        console.log(`[CSS] Saved minified ${file}`);
    }
});

console.log("¡Build de Seguridad y Minificación Completado!");
