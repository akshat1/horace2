# horace2

### Introduction
Horace is a tool to manage your e-books. Horace is intended to be
- Free and Open Source
- Easy to set-up and use
- Extensible
- Multi-platform
- Web enabled

### Current Status
Horace is under development at the moment. Currently it can identify pdf and text files, but eventually it will recognize other common ebook formats.

Unfortunately there is no simple install for Horace at the moment, as it is still in the early stages of development. However, if you would like to check it out then follow these steps

1. Checkout this repository
2. Run npm install
3. Install gulp (sudo npm install gulp -g)
4. Install mongodb
5. Create a config.json file in the project root (see sample config later in this readme file)
6. Build the front-end by running `gulp build`
7. Build the app by running `gulp build-app`
8. Run npm start
9. Point your browser to localhost:8080

### Configuration
Here's a sample config.json file

```
{
  "horace.port" : 8080,
  "horace.scan.serverstart": true,
  "horace.folders": [
    "/path/to/yourBooksFolder"
  ],
  "horace.adapters": []
}
```

### Contributing
Contributions to Horace are welcome. If you would like to contribute code then
1. Checkout the repo
2. Create a task in Horace taiga.io project
3. Create a local branch with the name "Taiga_XXX" where XXX is the taiga task number.
4. Make your changes, commit them and open a pull-request.

### More Information
Horace uses the beautiful taiga.io for project management. Visit our wiki at https://tree.taiga.io/project/speedysan-horace-2/wiki/home to know more about Horace including its architecture and other details. If you have a question which is not answered in the wiki then feel free to drop me a line and I will respond as soon as I can.
