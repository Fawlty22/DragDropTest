import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'dragDropTest';
  url: any = 'http://localhost:3001/upload/uploadFiles';
  files: File[] = [];

  constructor(private http: HttpClient) {}

  onRemove(event: any) {
    console.log(event);
    this.files.splice(this.files.indexOf(event), 1);
  }

  onFilesAdded(event: any) {
    console.log(event);
    this.files.push(...event.addedFiles);

    this.readFile(this.files[0]).then(fileContents => {
      // Put this string in a request body to upload it to an API.
      console.log(fileContents);
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

      reader.readAsText(file);
    });
  }
}
