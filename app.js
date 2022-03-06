const Jimp = require('jimp');
const inquirer = require('inquirer');
const fs = require('fs');

const startApp = async () => {

  const addTextWatermarkToImage = async function(inputFile, outputFile, text) {
    const image = await Jimp.read(inputFile);
    const font = await Jimp.loadFont(Jimp.FONT_SANS_32_WHITE);
  
    const textData = {
      text,
      alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
      alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE,
    };
  
    image.print(font, 0, 0, textData, image.getWidth(), image.getHeight());
  
    await image.quality(100).writeAsync(outputFile);
  };
  
  const addImageWatermarkToImage = async function(inputFile, outputFile, watermarkFile) {
    const image = await Jimp.read(inputFile);
    const watermark = await Jimp.read(watermarkFile);
  
    const x = image.getWidth() / 2 - watermark.getWidth() / 2;
    const y = image.getHeight() / 2 - watermark.getHeight() / 2;
  
    image.composite(watermark, x, y, {
      mode: Jimp.BLEND_SOURCE_OVER,
      opacitySource: 0.5,
    });
    await image.quality(100).writeAsync(outputFile);
  }

  const prepareOutputFilename = (filename) => {
    const [ name, ext ] = filename.split('.')
    return `${name}` + `-with-watermark.` + `${ext}`;
  };

  const makeImageBrighter = async function(inputFile) {
    const image = await Jimp.read(inputFile);
    image.brightness(0.2);
    await image.quality(100).writeAsync(inputFile);
  };

  const increaseContrast = async function(inputFile) {
    const image = await Jimp.read(inputFile);
    image.contrast(0.3);
    await image.quality(100).writeAsync(inputFile);
  };

  const makeImageBlackAndWhite = async function(inputFile) {
    const image = await Jimp.read(inputFile);
    image.greyscale();
    await image.quality(100).writeAsync(inputFile);
  };

  const invertImage = async function(inputFile) {
    const image = await Jimp.read(inputFile);
    image.invert(); 
    await image.quality(100).writeAsync(inputFile);
  };

  // Ask if user is ready

  try {
    const answer = await inquirer.prompt([{
      name: 'start',
      message: 'Hi! Welcome to "Watermark manager". Copy your image files to `\img` folder. Then you\'ll be able to use them in the app. Are you ready?',
      type: 'confirm',
    }]);

    // if answer is no, just quit the app
    if(!answer.start) process.exit();

    // ask about input file and watermark type

    const file = await inquirer.prompt([{
      name: 'inputImage',
      type: 'input',
      message: 'What file do you want to mark?',
      default: 'test.jpg',
    }]);

    if (!fs.existsSync('./img/' + file.inputImage)) {
      process.stdout.write('\nFile doesn\'t exist\n\n. Please try again');
      process.exit();
    }

    for (n = 1; ; n++) {
      const answerModification = await inquirer.prompt([{
        name: 'willModify',
        message: 'Would you like to modify your file?',
        type: 'confirm',
      }]);

      if (answerModification.willModify) {
          const modificationOptions = await inquirer.prompt([{
            name: 'modificationType',
            type: 'list',
            choices: ['Make image brighter', 'Increase contrast', 'Make image b&w', 'Invert image']
          }])
    
          if (modificationOptions.modificationType === 'Make image brighter'){
            makeImageBrighter('./img/' + file.inputImage, './img/' + prepareOutputFilename(file.inputImage));
            process.stdout.write('\nSuccess! Modification was applied\n\n');
          } else if (modificationOptions.modificationType === 'Increase contrast'){
            increaseContrast('./img/' + file.inputImage, './img/' + prepareOutputFilename(file.inputImage));
            process.stdout.write('\nSuccess! Modification was applied\n\n');
          } else if (modificationOptions.modificationType === 'Make image b&w'){
            makeImageBlackAndWhite('./img/' + file.inputImage, './img/' + prepareOutputFilename(file.inputImage));
            process.stdout.write('\nSuccess! Modification was applied\n\n');
          } else {
            invertImage('./img/' + file.inputImage, './img/' + prepareOutputFilename(file.inputImage));
            process.stdout.write('\nSuccess! Modification was applied\n\n');
          }
      } else {
        break;
      }
    }

    const options = await inquirer.prompt([{
      name: 'watermarkType',
      message: 'Which type of watermark?',
      type: 'list',
      choices: ['Text watermark', 'Image watermark'],
    }]);

    if(options.watermarkType === 'Text watermark') {
      const text = await inquirer.prompt([{
        name: 'value',
        type: 'input',
        message: 'Type your watermark text:',
      }])
      options.watermarkText = text.value;
      addTextWatermarkToImage('./img/' +file.inputImage, './watermark-with-text-img/' + prepareOutputFilename(file.inputImage), options.watermarkText);
    }
    else {
      const image = await inquirer.prompt([{
        name: 'filename',
        type: 'input',
        message: 'Type your watermark name:',
        default: 'logo.png',
      }]);
      options.watermarkImage = image.filename;
      addImageWatermarkToImage('./img/' + file.inputImage, './watermark-with-image-img/' + prepareOutputFilename(file.inputImage), './logos/' + options.watermarkImage);
    }
  } 
  catch (error) {
    process.stdout.write('\nSomething went wrong. Try again!\n\n');
    process.exit();
  } 
  finally {
    process.stdout.write('\nSuccess! Watermark was applied to your file.\n\n');
    startApp();
  }
}

startApp();



