from .information_container import IC


class File(IC):

    def __init__(self, file_id, name, directory, file_history, path, type):
        super().__init__(file_id, name, directory, file_history, path, None)
        self._type = type

    @property
    def type(self):
        return self._type

    @type.setter
    def type(self, value):
        self._type = value

    def to_json(self):
        return {
            'ic_id': self._ic_id,
            'name': self._name,
            'parent': self._parent,
            'history': self._history,
            'path': self._path,
            'type': self._type
        }

    @staticmethod
    def json_to_obj(json_file):
        return File(json_file['ic_id'],
                    json_file['name'],
                    json_file['parent'],
                    json_file['history'],
                    json_file['path'],
                    json_file['type'])


