class IC:

    def __init__(self, ic_id, name, parent, history, path, sub_folders):
        self._ic_id = ic_id
        self._name = name
        self._parent = parent
        self._history = history
        self._path = path
        self._sub_folders = sub_folders

    @property
    def ic_id(self):
        return self._ic_id

    @ic_id.setter
    def ic_id(self, value):
        self._ic_id = value

    @property
    def name(self):
        return self._name

    @name.setter
    def name(self, value):
        self._name = value

    @property
    def parent(self):
        return self._parent

    @parent.setter
    def parent(self, value):
        self._parent = value

    @property
    def history(self):
        return self._history

    @history.setter
    def history(self, value):
        self._history = value

    @property
    def path(self):
        return self._path

    @path.setter
    def path(self, value):
        self._path = value

    @property
    def sub_folders(self):
        return self._sub_folders

    @sub_folders.setter
    def sub_folders(self, value):
        self._sub_folders = value

    def to_json(self):
        return {
            'ic_id': self._ic_id,
            'name': self._name,
            'parent': self._parent,
            'history': self._history,
            'path': self._path,
            'sub_folders': self._sub_folders
        }

    @staticmethod
    def json_to_obj(json_file):
        return IC(json_file['ic_id'],
                  json_file['name'],
                  json_file['parent'],
                  json_file['history'],
                  json_file['path'],
                  json_file['sub_folders'])
