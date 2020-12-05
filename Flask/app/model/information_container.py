class IC:

    def __init__(self, ic_id, name, parent, history, path, parent_id, color, comments, tags, sub_folders, access):
        self._ic_id = ic_id
        self._name = name
        self._parent = parent
        self._history = history
        self._path = path
        self._comments = comments
        self._tags = tags
        self._sub_folders = sub_folders
        self._is_directory = True
        self._parent_id = parent_id
        self._overlay_type = "ic"
        self._color = color
        self._access = access
        # print('__INIT__ IC', access[0].role)

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
    def is_directory(self):
        return self._is_directory
        
    @property
    def overlay_type(self):
        return self._overlay_type

    @property
    def comments(self):
        return self._comments

    @comments.setter
    def comments(self, value):
        self._comments = value

    @property
    def tags(self):
        return self._tags

    @tags.setter
    def tags(self, value):
        self._tags = value

    @property
    def sub_folders(self):
        return self._sub_folders

    @sub_folders.setter
    def sub_folders(self, value):
        self._sub_folders = value

    @property
    def access(self):
        return self._access

    @access.setter
    def access(self, value):
        self._access = value

    @property
    def parent_id(self):
        return self._parent_id

    @property
    def color(self):
        return self._color

    @color.setter
    def color(self, value):
        self._color = value

    @parent_id.setter
    def parent_id(self, value):
        self._parent_id = value

    def to_json(self):
        # print('ic to_json() -+-+-***', self._access[0].role)
        return {
            'ic_id': self._ic_id,
            'name': self._name,
            'parent': self._parent,
            'history': [x.to_json() for x in self._history],
            'path': self._path,
            'is_directory': self._is_directory,
            'parent_id': self._parent_id,
            'color': self._color,
            'overlay_type': self._overlay_type,
            'comments': [x.to_json() for x in self._comments],
            'tags': [x.to_json() for x in self._tags],
            'sub_folders': [x.to_json() for x in self._sub_folders],
            'access': [x.to_json() for x in self._access]
        }

    @staticmethod
    def json_to_obj(json_file):
        return IC(json_file['ic_id'],
                  json_file['name'],
                  json_file['parent'],
                  [x.json_to_obj() for x in json_file['history']],
                  json_file['path'],
                  json_file['parent_id'],
                  json_file['color'],
                  [x.json_to_obj() for x in json_file['comments']],
                  [x.json_to_obj() for x in json_file['tags']],
                  [x.json_to_obj() for x in json_file['sub_folders']],
                  [x.json_to_obj() for x in json_file['access']]
                  )
