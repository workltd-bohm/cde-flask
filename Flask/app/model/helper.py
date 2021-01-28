import json

def get_iso_tags():
    doc = open('app/static/file/input.json', 'r')
    file = json.loads(doc.read())
    doc.close()
    filter_file = {}
    keys = list(file.keys())
    values = list(file.values())
    for i in range(0, len(keys), 2):
        elements = []
        name = 'Default'
        order = -1
        for j in range(0, len(values[i])):
            elements.append(values[i][j] + ', ' + values[i + 1][j])
        key = ''
        if keys[i] == 'volume_system_code':
            key = 'project_volume_or_system'
            name = 'Project Volume or System'
            order = 2
        if keys[i] == 'level_code':
            key = 'project_level'
            name = 'Project Level'
            order = 3
        if keys[i] == 'type_code':
            key = 'type_of_information'
            name = 'Type of Information'
            order = 4
        if keys[i] == 'role_code':
            key = 'role_code'
            name = 'Role Code'
            order = 5
        if keys[i] == 'number_code':
            key = 'file_number'
            name = 'File Number'
            order = 6
        if keys[i] == 'status_code':
            key = 'status'
            name = 'Status'
            order = 7
        if keys[i] == 'revision_code':
            key = 'revision'
            name = 'Revision'
            order = 8
        if keys[i] == 'uniclass_code':
            key = 'uniclass_2015'
            name = 'Uniclass 2015'
            order = 9
        filter_file[key] = {'elements': elements, 'name': name, 'order': order}
    return filter_file


def get_iso_filename(file_ic, project, user):
    # TODO fix the check by ,
    # tag_code_list = [x['tag'].split(',')[0][1:].replace("_", ".") for x in file_ic.to_json()['tags'] if ',' in x['tag']]
    tag_code_list = {}
    for tag in file_ic.to_json()['tags']:
        if ',' in tag['tag']:
            tag_code_list[tag['key']] = tag['tag'].split(',')[0][1:].replace("_", ".")
    file_name = file_ic.name + file_ic.type
    # iso_name = '-'.join(tag_code_list) + '_' + file_name
    if project['is_iso19650']:
        try:
            iso_name = project['code'] + '-' \
                        + user['company_code'] + '-' \
                        + tag_code_list['project_volume_or_system'] + '-' \
                        + tag_code_list['project_level'] + '-' \
                        + tag_code_list['type_of_information'] + '-' \
                        + tag_code_list['role_code'] + '-' \
                        + tag_code_list['file_number'] + '-' \
                        + tag_code_list['status'] + '-' \
                        + tag_code_list['revision'] \
                        + '_' + file_name
        except:
            iso_name = file_name
    else:
        iso_name = file_name
    return iso_name


def get_input_file():
    doc = open('app/static/file/input.json', 'r')
    file = json.loads(doc.read())
    doc.close()
    
    return file
