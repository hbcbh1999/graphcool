import * as ts from 'typescript'
// import * as globby from 'globby'
import * as path from 'path'

export default class TypescriptBuilder {
  buildDir: string
  constructor(buildDir: string) {
    this.buildDir = buildDir
  }
  //
  // async getFileNames() {
  //   return globby(['**/*.js', '**/*.ts', '!node_modules', '!**/node_modules'], {cwd: this.buildDir})
  // }

  async compile(fileNames: string[]) {
    // const fileNames = await this.getFileNames()
    const program = ts.createProgram(fileNames, this.config)

    const emitResult = program.emit()

    const allDiagnostics = ts.getPreEmitDiagnostics(program).concat(emitResult.diagnostics)

    allDiagnostics.forEach(diagnostic => {
      if (!diagnostic.file) {
        console.log(diagnostic)
      }
      const {line, character} = diagnostic.file!.getLineAndCharacterOfPosition(diagnostic.start!)
      const message = ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n')
      console.log(`${diagnostic.file!.fileName} (${line + 1},${character + 1}): ${message}`)
    })

    if (emitResult.emitSkipped) {
      throw new Error('Typescript compilation failed')
    }

    return emitResult.emittedFiles
  }

  get config(): ts.CompilerOptions {
    return {
      preserveConstEnums: true,
      strictNullChecks: true,
      sourceMap: true,
      target: ts.ScriptTarget.ES5,
      moduleResolution: ts.ModuleResolutionKind.NodeJs,
      lib: ['lib.es2015.d.ts'],
      rootDir: this.buildDir,
      allowJs: true,
      listEmittedFiles: true,
      outDir: path.join(this.buildDir, '_dist/'),
    }
  }
}