""" This script updates the gitlab pipeline results to respective README.md """

# import sys to get command line arguments
import sys
# import re to find regular expression
import re
# import github to use github api 
from github import Github 
import argparse

parser = argparse.ArgumentParser()

parser.add_argument("--pipeline_id",
       help="gitlab pipeline id to create gitlab pipeline_url")

parser.add_argument("--coverage",
       help="getting the pipeline coverage")

parser.add_argument("--tag",
       help="gitlab pipeline release tag")

parser.add_argument("--time_stamp",
       help="time of gitlab pipeline run")

parser.add_argument("--token",
       help="github authentication token")

args = parser.parse_args()
pipeline_id = args.pipeline_id
coverage = args.coverage
tag = args.tag
time_stamp = args.time_stamp
token = args.token

github_token = Github(token)
repo = github_token.get_repo("litmuschaos/litmus-e2e")
b= repo.get_branch(branch="master")
contents = repo.get_contents("openebs-pipeline/openebs.md", "master")
file = repo.get_contents(contents.path, "master")
file_path = contents.path
file_content=str(file.decoded_content)
content_list = file_content.split('\n')
# Number of retries 
file_update_retries = 5

# github pipeline url using pipeline_id
pipeline_url ="<a href= \"https://gitlab.mayadata.io/litmuschaos/litmus-e2e/pipelines/{0}\">{0}</a>".format(pipeline_id)

def fetch_file_content():
    # fetching file contents of github file_path readme.md
    file = repo.get_contents(file_path, "master")
    file_content=str(file.decoded_content, 'utf-8')
    content_list = file_content.split('\n')
    totalCoverage= '[!['+coverage+'%](https://progress-bar.dev/'+coverage+')](https://bit.ly/396abMB)'

    # updating result's table if the table is already there
    if file_content.find('|')>0:
        new_pipeline = '|     {}           |  {}           | {}  | {}  |'.format(pipeline_url,time_stamp,tag,totalCoverage)
        index = content_list.index('| Pipeline ID |   Execution Time        | Release Version | Coverage (in %) |')
        content_list.insert(index+2,new_pipeline)
        updated_file_content = ('\n').join(content_list)

    # creating result's table for first pipeline result entry 
    else:
        updated_file_content =  '| Pipeline ID |   Execution Time        | Release Version | Coverage (in %) |\n'
        updated_file_content = updated_file_content + ('|---------|---------------------------|--------------|--------------|\n')
        updated_file_content = updated_file_content + ('|    {}   |  {}           |  {}     |  {}     |\n'.format(pipeline_url,time_stamp,tag,totalCoverage))
        index = len(content_list)
        content_list.insert(index, updated_file_content)
        updated_file_content = ('\n').join(content_list)
    return file, updated_file_content
file, updated_file_content = fetch_file_content()

# github commit message 
commit_message = "new pipeline result updated"
exception = ''
# file update retry iterator
loop_itr = 0
# file update try count
try_count = 5

# github exception handling
print("Trying to update readme.md file at path: {}".format(file_path))
try:
    print("README.md content update try: {}".format(try_count))
    try_count += 1
    repo.update_file(file_path, commit_message, updated_file_content, file.sha, branch="master")
    print("Readme.md updated successfully")
except github.GithubException as e:
    exception = e
    print("Error message:{}".format(exception.data['message']))

    # retryng updating readme.md after refetching the file contents
    while loop_itr < file_update_retries:

     # 409 is github exception status in case of conflict
     # retry committing to respective pipeline's readme.md in case of conflict by refetching readme.md file contents
     if exception.status == 409:
            
      # exception handling for github exception status: 409
      try:
       print("README.md content update try: {}".format(try_count))

       # refetch github readme.md file content
       file,updated_file_content = fetch_file_content()
       try_count += 1

       # retry committing readme.md file 
       repo.update_file(file_path, commit_message, updated_file_content, file.sha, branch="master")
       print("Readme.md updated successfully")

       # exit the loop as file updated successfully
       break
      except github.GithubException as e:
       exception = e
       print("Error message:{}".format(exception.data['message']))
       loop_itr = loop_itr + 1

     # exit the loop if github exception is not 409
     else:
       print("Readme.md updation failed")
       break