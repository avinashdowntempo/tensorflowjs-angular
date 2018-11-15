import { Component, ViewChild, ElementRef, OnInit } from '@angular/core';
import * as tf from '@tensorflow/tfjs';
import yolo, { downloadModel } from 'tfjs-yolo-tiny';
import { WebcamService } from './webcam.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  object = 'none';
  name: string;
  videoInputs: Array<string> = [];
  isRemote = false;
  model;
  connectUser: string;
  localStream: MediaStream;

  availableDevices: string[] = [];

  servers: any = null;
  offerOptions: any = {
    offerToReceiveAudio: 1,
    offerToReceiveVideo: 1
  };

  @ViewChild('localVideo') localVideo: ElementRef;
  @ViewChild('webcamElem') webcamElem: ElementRef;

  constructor(private webcamService: WebcamService) {
  }
  ngOnInit() {
    this.start();
    this.localVideo.nativeElement.width = 416;
    this.localVideo.nativeElement.height = 416;
    this.webcamService.webcamElement = this.localVideo.nativeElement;
  }
  async main() {
    try {
      this.model = await downloadModel('https://raw.githubusercontent.com/MikeShi42/yolo-tiny-tfjs/master/model2.json');
      alert('model has been loaded');
      console.log(this.model);
      this.run();

    } catch (e) {
      console.error(e);
      //  showError();
    }
  }

  async run() {
    while (true) {
      const inputImage = this.webcamService.capture();
      const t0 = performance.now();
      const boxes = await yolo(inputImage, this.model);
      inputImage.dispose();
      const t1 = performance.now();
      // console.log('YOLO inference took ' + (t1 - t0) + ' milliseconds.');
      // console.log('tf.memory(): ', tf.memory());
      this.clearRects();
      boxes.forEach(box => {
        const {
          top, left, bottom, right, classProb, className,
        } = box;
        this.drawRect(left, top, right - left, bottom - top,
          `${className} Confidence: ${Math.round(classProb * 100)}%`, 'red', Math.round(classProb * 100));
      });
      await tf.nextFrame();
    }
  }

  drawRect(x, y, w, h, text = '', color = 'red', perc) {
    if (perc > 60) {
      this.object = text;
    }
    console.warn('detected objects is' + text + '' + x + '' + y + '' + w + '' + h + '');
    const rect = document.createElement('div');
    rect.classList.add('rect');
    rect.style.cssText = `top: ${y}; left: ${x}; width: ${w}; height: ${h}; border-color: ${color}`;
    const label = document.createElement('div');
    label.classList.add('label');
    label.innerText = text;
    rect.appendChild(label);
    this.webcamElem.nativeElement.appendChild(rect);
  }

  clearRects() {
    const rects = document.getElementsByClassName('rect');
    while (rects[0]) {
      rects[0].parentNode.removeChild(rects[0]);
    }
  }

  start() {
    navigator.mediaDevices.enumerateDevices()
      .then((devices) => {
        devices.forEach((device) => {
          if (device.kind === 'videoinput') {
            console.log(device.kind + ':' + device.label +
              ' id = ' + device.deviceId);
            // alert(device.label + device.deviceId);
            this.videoInputs.push(device.deviceId);
          }
        });
        // alert(this.videoInputs);
        // window.alert('please print me' + this.videoInputs[this.videoInputs.length - 1].toString());
        navigator.mediaDevices.getUserMedia({
          audio: true,
          video: {
            deviceId: { exact: this.videoInputs[this.videoInputs.length - 1].toString() }
          }
        })
          .then(this.gotStream.bind(this))
          .catch(function (e) {
            // alert('getUserMedia() error: ' + e.name);
          });
      })
      .catch(function (err) {
        console.log(err.name + ': ' + err.message);
      });
  }


  gotStream(stream) {
    this.localVideo.nativeElement.srcObject = stream;
    this.localStream = stream;
    this.getUserDevice();
    this.main();
  }

  getUserDevice() {
    this.localStream.getAudioTracks().forEach(tracks => {
      this.availableDevices.push(tracks.label);
    });
    this.localStream.getVideoTracks().forEach(tracks => {
      this.availableDevices.push(tracks.label);
    });
    // alert(this.availableDevices);
  }
}
