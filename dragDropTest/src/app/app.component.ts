import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  title = 'dragDropTest';
  files: File[] = [];
  imageURL: any;
  fileToGet: string = 'Arctic-Treeline-Kaldheim-MtG-Art.jpg';
  // fileToSend: string | undefined;
  bucketName: string = 'dragdropbucket22';
  bucketRegion: string = 'us-east-1';
  accessKey: string = environment.accessKey;
  secretAccessKey: string = environment.secretKey;
  s3: S3Client = new S3Client({
    credentials: {
      accessKeyId: this.accessKey,
      secretAccessKey: this.secretAccessKey,
    },
    region: this.bucketRegion,
  });

  constructor(private http: HttpClient) {}
  ngOnInit(): void {
    this.getFile(this.fileToGet);
  }

  async getFile(fileName: string) {
    const params = {
      Bucket: this.bucketName,
      Key: fileName,
    };

    const command = new GetObjectCommand(params);

    this.imageURL = await getSignedUrl(this.s3, command, { expiresIn: 3600 });
  }

  async onUpload() {
    if (this.files.length == 0) {
      alert('There are no files to upload');
      return;
    }

    for (let i = 0; i < this.files.length; i++) {
      let validFileType = this.detectFileType(this.files[i].name);
      if (!validFileType) {
        alert(this.files[i].name + ' is not a valid file type');
      } else {
        let buffer = await this.readFile(this.files[i]);

        const params = {
          Bucket: this.bucketName,
          Key: this.files[i].name,
          Body: buffer,
          ContentType: 'application/x-zip-compressed',
        };

        const command = new PutObjectCommand(params);

        await this.s3.send(command).then((response) => {
          console.log('upload successful', response);
        });
      }
    }
  }

  async readFile(file: File): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        return resolve((e.target as FileReader).result);
      };

      reader.onerror = (e) => {
        console.error(`FileReader failed on file ${file.name}.`);
        return reject(null);
      };

      if (!file) {
        console.error('No file to read.');
        return reject(null);
      }

      reader.readAsArrayBuffer(file);
    });
  }

  onFilesAdded(event: any) {
    this.files.push(...event.addedFiles);
  }

  onRemove(event: any) {
    // console.log(event);
    this.files.splice(this.files.indexOf(event), 1);
  }

  detectFileType(name: string) {
    let allowedExtensions = /(\.pdf|\.cad|\.jpg|\.zip)$/i;
    if (!allowedExtensions.exec(name)) {
      return false;
    } else {
      return true;
    }
  }
}

// This used to live inside the getFile function.
// This is the method of getting the file from s3 usingthe getObjectCommand that opens up a readableStream
// Could not get this to Worker, although im sure it is possible.

// await this.s3.send(command)
//   .then(response => {
//     console.log('response here',response)
//     this.loadedImage = response
//     console.log('loadediomage', this.loadedImage)
//     // console.log('URL', URL.createObjectURL(response.Body))
//   })
