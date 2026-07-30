const fs = require('fs');
const path = require('path');
const JavaScriptObfuscator = require('javascript-obfuscator');
const CleanCSS = require('clean-css');
const { minify: minifyHtml } = require('html-minifier-terser');

// Configuración de rutas
const SRC_DIR = __dirname; // Leemos desde la raíz, tal como la convención del proyecto lo exige
const DIST_DIR = path.join(__dirname, 'public'); // Vercel espera la carpeta public por defecto

// Crear carpetas de destino
if (!fs.existsSync(DIST_DIR)) fs.mkdirSync(DIST_DIR);
if (!fs.existsSync(path.join(DIST_DIR, 'js'))) fs.mkdirSync(path.join(DIST_DIR, 'js'));
if (!fs.existsSync(path.join(DIST_DIR, 'css'))) fs.mkdirSync(path.join(DIST_DIR, 'css'));

// Función auxiliar para copiar carpetas recursivamente
function copyFolderSync(from, to) {
    if (!fs.existsSync(to)) fs.mkdirSync(to);
    fs.readdirSync(from).forEach(element => {
        if (fs.lstatSync(path.join(from, element)).isFile()) {
            fs.copyFileSync(path.join(from, element), path.join(to, element));
        } else {
            copyFolderSync(path.join(from, element), path.join(to, element));
        }
    });
}

// 0. Copiar assets estáticos
console.log("[BUILD] Copiando assets estáticos a public/...");
const staticFiles = ['manifest.json', 'sw.js', 'robots.txt', 'sitemap.xml'];
staticFiles.forEach(f => {
    if (fs.existsSync(path.join(__dirname, f))) {
        fs.copyFileSync(path.join(__dirname, f), path.join(DIST_DIR, f));
    }
});
if (fs.existsSync(path.join(__dirname, 'assets'))) {
    copyFolderSync(path.join(__dirname, 'assets'), path.join(DIST_DIR, 'assets'));
}

// 1. Minificar HTML
async function processHTML() {
    // Si no está en src, asume que sigue en la raíz
    const srcHtmlPath = fs.existsSync(path.join(SRC_DIR, 'index.html')) 
                        ? path.join(SRC_DIR, 'index.html') 
                        : path.join(__dirname, 'index.html');
                        
    const distHtmlPath = path.join(DIST_DIR, 'index.html');
    
    if (fs.existsSync(srcHtmlPath)) {
        const htmlCode = fs.readFileSync(srcHtmlPath, 'utf8');
        console.log(`[HTML] Minifying index.html...`);
        const result = await minifyHtml(htmlCode, {
            collapseWhitespace: true,
            removeComments: true,
            removeRedundantAttributes: true,
            removeScriptTypeAttributes: true,
            removeStyleLinkTypeAttributes: true,
            useShortDoctype: true,
            minifyCSS: true,
            minifyJS: true,
            removeAttributeQuotes: true,
            collapseInlineTagWhitespace: true,
            sortAttributes: true,
            sortClassName: true
        });
        fs.writeFileSync(distHtmlPath, result);
        console.log(`[HTML] Saved minified index.html to public/`);
    }
}

// 2. Ofuscar JavaScript
const jsFiles = ['i18n.js', 'main.js'];
const obfuscatorOptions = {
    compact: true,
    controlFlowFlattening: true,
    controlFlowFlatteningThreshold: 0.75,
    deadCodeInjection: true,
    deadCodeInjectionThreshold: 0.4,
    debugProtection: true,
    debugProtectionInterval: 2000,
    disableConsoleOutput: true,
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
        console.log(`[JS] Copiando ${file}...`);
        fs.copyFileSync(srcPath, distPath);
        console.log(`[JS] Saved ${file} to public/`);
    }
});

// 3. Minificar CSS
const cssFiles = ['style.css'];
cssFiles.forEach(file => {
    const srcPath = path.join(SRC_DIR, 'css', file);
    const distPath = path.join(DIST_DIR, 'css', file);
    
    if (fs.existsSync(srcPath)) {
        const cssCode = fs.readFileSync(srcPath, 'utf8');
        console.log(`[CSS] Minifying ${file}...`);
        const output = new CleanCSS({ level: 2 }).minify(cssCode);
        fs.writeFileSync(distPath, output.styles);
        console.log(`[CSS] Saved minified ${file} to public/`);
    }
});

// Run HTML minifier
processHTML().then(() => {
    console.log("¡Build de Seguridad y Minificación Completado Exitosamente en public/!");
}).catch(err => {
    console.error("Error en build:", err);
});
