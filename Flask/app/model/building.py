class Building:

    def __init__(self, name, description):
        self._name = name
        self._description = description

    @property
    def name(self):
        return self._name

    @name.setter
    def name(self, value):
        self._name = value

    @property
    def description(self):
        return self._description

    @description.setter
    def description(self, value):
        self._description = value

    def to_json(self):
        return {
            'name': self._name,
            'description': self._description
        }

    @staticmethod
    def json_to_obj(json_file):
        return Building(
            json_file['name'],
            json_file['description']
        )
