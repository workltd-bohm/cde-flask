from .information_container import IC


class File(IC):

    def __init__(self, file_id, name, directory, file_history, path, type, stored_id=""):
        super().__init__(file_id, name, directory, file_history, path, None)
        self._type = type
        self._stored_id = stored_id

    @property
    def type(self):
        return self._type

    @type.setter
    def type(self, value):
        self._type = value

    @property
    def stored_id(self):
        return self._stored_id

    @stored_id.setter
    def stored_id(self, value):
        self._stored_id = value

    def to_json(self):
        return {
            'ic_id': self._ic_id,
            'name': self._name,
            'parent': self._parent,
            'history': self._history,
            'path': self._path,
            'type': self._type,
            'stored_id': self._stored_id
        }

    @staticmethod
    def json_to_obj(json_file):
        return File(json_file['ic_id'],
                    json_file['name'],
                    json_file['parent'],
                    json_file['history'],
                    json_file['path'],
                    json_file['type'],
                    json_file['stored_id'])


