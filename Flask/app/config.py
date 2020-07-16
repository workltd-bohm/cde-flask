class Basic:
    """
    Basic config.
    """

    PORT = 5656

    # from db.db_file_adapter import DBFileAdapter
    # DB = DBFileAdapter()

    from db.db_mongo_adapter import DBMongoAdapter
    DB = DBMongoAdapter()

    SECRET_KEY = "key"
    DEBUG = True

# Here production, staging, development, testing config classes could be made

config = {
    "basic": Basic
}
