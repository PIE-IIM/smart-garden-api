## Architecture
```
.
├── models //to type with typescript
|
├── prisma     //here you have all the configs about db migrations
│   ├── migrations //history of all the migrations
│   └── schema.prisma // declare the models of the database here
|
├── src 
│   ├── index.ts //the APIs
|
├── makefile //the alias the run faster and anything else 
```