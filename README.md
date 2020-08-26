# Resource Manager

Basic resource management / cataloging system, such as what might be used for a small library.

## Usage

### Prerequisites

This project requires:

- [Node.js & NPM](https://nodejs.org/en/)
- [MariaDB](https://mariadb.org/)

### Installation

```sh
$ git clone https://github.com/LachlanWalls/resource-manager & cd resource-manager
$ npm install
```

### Configuration

At this point, make a copy of config.json.example, and rename it to config.json.

This is where you can add your basic site settings, and most importantly, the MariaDB config.

### MariaDB Setup

Assuming you already have mariadb installed, connect to it to import the example data.

```sh
$ mysql -u USERNAME -p
```

Now, create the database. This can be named whatever you like, but make sure the config is updated.

```sql
> CREATE DATABASE resource-manager;
```

Now exit the MySQL prompt with `CTRL+D`.

Finally, import the example data to set up tables.

```sh
$ mysql -u USERNAME -p resource-manager < data-dump.sql
```

The example data should now be imported!

For more information on this, [check out this article](https://www.digitalocean.com/community/tutorials/how-to-import-and-export-databases-in-mysql-or-mariadb).

### Starting the Webapp

Starting the webapp is as simple as, when in the directory, running:

```sh
$ node index.js
```

You may want to look into a process manager such as [PM2](https://pm2.keymetrics.io/) to automate this.
