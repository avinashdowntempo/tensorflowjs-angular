import { Injectable } from '@angular/core';

import * as tf from '@tensorflow/tfjs';
import { Tensor4D, Tensor3D } from '@tensorflow/tfjs';

@Injectable({
  providedIn: 'root'
})
export class WebcamService {
  webcamElement: HTMLVideoElement;
  capture() {
    return tf.tidy(() => {
      // Reads the image as a Tensor from the webcam <video> element.
      const webcamImage = tf.fromPixels(this.webcamElement);
      // Crop the image so we're using the center square of the rectangular
      // webcam.
      const croppedImage = this.cropImage(webcamImage);
      // Expand the outer most dimension so we have a batch size of 1.
      const batchedImage = croppedImage.expandDims(0);
      // Normalize the image between -1 and 1. The image comes in between 0-255,
      // so we divide by 127 and subtract 1
      return batchedImage.toFloat().div(tf.scalar(255));
    });
  }

  cropImage(img: Tensor3D) {
    const size = Math.min(img.shape[0], img.shape[1]);
    const centerHeight = img.shape[0] / 2;
    const beginHeight = centerHeight - (size / 2);
    const centerWidth = img.shape[1] / 2;
    const beginWidth = centerWidth - (size / 2);
    return img.slice([beginHeight, beginWidth, 0], [size, size, 3]);
  }

  adjustVideoSize(width: number, height: number) {
    const aspectRatio = width / height;
    if (width >= height) {
      this.webcamElement.width = aspectRatio * this.webcamElement.height;
    } else if (width < height) {
      this.webcamElement.height = this.webcamElement.width / aspectRatio;
    }
  }
}



