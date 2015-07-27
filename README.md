# horace2

### Introduction
Horace is an e-book management software. Horace is intended to be
- Free and Open Source
- Easy to set-up and use
- Extensible
- Multi-platform
- Web enabled

### Current Status
Horace is under development at the moment. Currently it can identify pdf files, but eventually it will recognize other common ebook formats.

Unfortunately there is no simple install for Horace at the moment, as it is still in the early stages of development. However, if you would like to check it out then follow these steps

1. Checkout this repository
2. run npm install
3. Create a config.json file in the project root with path to your books folder
4. Run npm start
4. Point your browser to localhost:8080

### Configuration
Configuration options for Horace can be seen in app/config.coffee. One may create a config.json file in the project root to override these settings.

The most important setting is 'horace.folders'. This is a string array containing paths to all the folders that you want to monitor and that may contain books. Folders are scanned recursively.

Here's a sample config.json file

```
{
	"horace.folders": "~/AllBooks",
	"horace.adapters": [
		"./adapters/pdf-adapter.coffee"
	]
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
