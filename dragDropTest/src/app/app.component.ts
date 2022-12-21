import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl  } from"@aws-sdk/s3-request-presigner";
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit{
  title = 'dragDropTest';
  url: any = 'http://localhost:3001/upload/uploadFiles';
  files: File[] = [];
  loadedImage: any;
  imageURL: any;
  filename: string = 'FileNameHere2'
  bucketName: string = "dragdropbucket22"
  bucketRegion: string = "us-east-1"
  accessKey: string = "AKIAXB4AS56573Z5C3ZK"
  secretAccessKey: string = "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"
  s3: S3Client = new S3Client({
    credentials: {
      accessKeyId: this.accessKey,
      secretAccessKey: this.secretAccessKey
    },
    region: this.bucketRegion
  })

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.getFile(this.filename);
  }

  async getFile(fileName: string){
    const streamToString = (stream: any) =>
    new Promise((resolve, reject) => {
      const chunks: any = [];
      stream.on("data", (chunk: any) => chunks.push(chunk));
      stream.on("error", reject);
      stream.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    });

    const params = {
      Bucket: this.bucketName,
      Key: fileName,
    }

    const command = new GetObjectCommand(params);
    
    // await this.s3.send(command)
    //   .then(response => {
    //     console.log('response here',response)
    //     this.loadedImage = response
    //     console.log('loadediomage', this.loadedImage)
    //     // console.log('URL', URL.createObjectURL(response.Body))
    //   })
    this.imageURL = await getSignedUrl(this.s3, command, {expiresIn: 3600})
    console.log('imageURL', this.imageURL)
  }

  onRemove(event: any) {
    // console.log(event);
    this.files.splice(this.files.indexOf(event), 1);
  }

  onFilesAdded(event: any) {
    // console.log(event);
    this.files.push(...event.addedFiles);

    this.readFile(this.files[0]).then(fileContents => {
      // Put this string in a request body to upload it to an API.
      // console.log(fileContents);
    })
  }

  async onUpload(){
  //   let formData: FormData = new FormData();
  //   let url = 'asdasdasd'
  //   for (let i = 0; i < this.files.length; i++){
  //     formData.append('file-'+i, this.files[i], this.files[i].name);
  //   }
  //   for (var key of formData.entries()) {
      
  //     console.log(key);
  //     console.log(key[0] + ', ' + key[1]);
  // }

    let string = await this.readFile(this.files[0])

    const params = {
      Bucket: this.bucketName,
      Key: this.filename,
      Body: string,
      ContentType: 'image'
    }

    const command = new PutObjectCommand(params);
    
    await this.s3.send(command)
      .then(response => {
        console.log(response)
      })
  }

  async readFile(file: File): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = e => {
        return resolve((e.target as FileReader).result);
      };

      reader.onerror = e => {
        console.error(`FileReader failed on file ${file.name}.`);
        return reject(null);
      };

      if (!file) {
        console.error('No file to read.');
        return reject(null);
      }

      reader.readAsDataURL(file);
    });
  }
}
