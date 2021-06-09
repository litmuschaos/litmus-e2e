""" This script updates the gitlab pipeline results to respective Pipeline table """

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

parser.add_argument("--pipeline",
help="the name of pipeline")

parser.add_argument("--token",
       help="github authentication token")

args = parser.parse_args()
pipeline_id = args.pipeline_id
coverage = args.coverage
tag = args.tag
time_stamp = args.time_stamp
pipeline=args.pipeline
token = args.token

github_token = Github(token)

def get_file_to_update(pipeline,tag):
       if tag == "ci":
              if pipeline == "pod-level":
                     return "generic-pipeline/pipeline-runs/pod-level-run.html"
              elif pipeline == "node-level":
                     return "generic-pipeline/pipeline-runs/node-level-run.html"
              elif pipeline == "component":
                     return "generic-pipeline/pipeline-runs/litmus-component-run.html"
              elif pipeline == "portal-e2e":
                     return "portal-pipeline/pipeline-runs/portal-run.html"
              else:
                     raise Exception('Sorry, no pipeline found with name '+pipeline)
       elif "RC" in tag:
              if pipeline == "pod-level":
                     return "generic-pipeline/pipeline-runs/pod-level-rc.html"
              elif pipeline == "node-level":
                     return "generic-pipeline/pipeline-runs/node-level-rc.html"
              elif pipeline == "component":
                     return "generic-pipeline/pipeline-runs/litmus-component-rc.html"
              elif pipeline == "portal-e2e":
                     return "portal-pipeline/pipeline-runs/portal-rc.html"
              else:
                     raise Exception('Sorry, no pipeline found with name '+pipeline)
       else:
              if pipeline == "pod-level":
                     return "generic-pipeline/pipeline-runs/pod-level-ga.html"
              elif pipeline == "node-level":
                     return "generic-pipeline/pipeline-runs/node-level-ga.html"
              elif pipeline == "component":
                     return "generic-pipeline/pipeline-runs/litmus-component-ga.html"
              elif pipeline == "portal-e2e":
                     return "portal-pipeline/pipeline-runs/portal-ga.html"
              else:
                     raise Exception('Sorry, no pipeline found with name '+pipeline)

repo = github_token.get_repo("litmuschaos/litmus-e2e")
b= repo.get_branch(branch="gh-pages")
filename = get_file_to_update(pipeline,tag)
print("filename to be updated: "+filename)
contents = repo.get_contents(filename, "gh-pages")
file = repo.get_contents(contents.path, "gh-pages")
file_path = contents.path
file_content=str(file.decoded_content)
content_list = file_content.split('\n')
# Number of retries 
file_update_retries = 5

# github pipeline url using pipeline_id
pipeline_url ="<a href= \"https://github.com/litmuschaos/litmus-e2e/actions/runs/{0}\">{0}</a>".format(pipeline_id)

def fetch_file_content():
    # fetching file contents of github file_path
    count=0
    file = repo.get_contents(file_path, "gh-pages")
    file_content=str(file.decoded_content, 'utf-8')
    content_list = file_content.split('\n')
    totalCoverage= '<a href=\"https://bit.ly/2OLie8t\"><img alt='+coverage+'% src=\"https://progress-bar.dev/'+coverage+'\" /></a>'
    if tag =="ci":
           version_name = "Version"
    else:
           version_name = "Release Version"
    
    index = content_list.index("      <script type = 'text/javascript'>")
    del content_list[index+1]
    content_list.insert(index+1,("var data = [['Total', 'Coverage'],['Passed',  {}],['Failed',  {}],]".format(coverage, str(100- int(coverage)))))
    updated_file_content =  ('\n').join(content_list)

    # updating result's table if the table is already present
    if file_content.find('<table>\n <tr>\n  <th>Pipeline ID</th>\n  <th>Execution Time</th>\n  <th>'+version_name+'</th></tr>\n')>0:
        new_pipeline = ' <tr>\n  <td>{}</td>\n  <td>{}</td>\n  <td>{}</td>\n </tr>\n'.format(pipeline_url,time_stamp,tag)
        index = content_list.index('  <th>'+version_name+'</th></tr>')
        content_list.insert(index+2,new_pipeline)
        for line in content_list:
               count += line.count("<tr>")  
       # The maximum length of the html table will be of 20 rows.
       # For the insertion of any extra row after this will pop out the last row of table.
        if count > 20:
               last_index = content_list.index('</table>')
               for i in range(1,7):
                      del content_list[last_index-i]
        updated_file_content = ('\n').join(content_list)

    # creating result's table for first pipeline result entry 
    else:
        updated_file_content =  '<table>\n <tr>\n  <th>Pipeline ID</th>\n  <th>Execution Time</th>\n  <th>'+version_name+'</th></tr>\n'
        updated_file_content = updated_file_content + (' <tr>\n  <td>{}</td>\n  <td>{}</td>\n  <td>{}</td>\n </tr>\n'.format(pipeline_url,time_stamp,tag))
        updated_file_content = updated_file_content + '</table>'
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
print("Trying to update respective html files at path: {}".format(file_path))
try:
    print("Pipeline table content update try: {}".format(try_count))
    try_count += 1
    repo.update_file(file_path, commit_message, updated_file_content, file.sha, branch="gh-pages")
    print("Pipeline table updated successfully")
except github.GithubException as e:
    exception = e
    print("Error message:{}".format(exception.data['message']))

    # retryng updating Pipeline table after refetching the file contents
    while loop_itr < file_update_retries:

     # 409 is github exception status in case of conflict
     # retry committing to respective pipeline's Pipeline table in case of conflict by refetching Pipeline table file contents
     if exception.status == 409:
            
      # exception handling for github exception status: 409
      try:
       print("Pipeline table content update try: {}".format(try_count))

       # refetch github Pipeline table file content
       file,updated_file_content = fetch_file_content()
       try_count += 1

       # retry committing Pipeline table file 
       repo.update_file(file_path, commit_message, updated_file_content, file.sha, branch="gh-pages")
       print("Pipeline table updated successfully")

       # exit the loop as file updated successfully
       break
      except github.GithubException as e:
       exception = e
       print("Error message:{}".format(exception.data['message']))
       loop_itr = loop_itr + 1

     # exit the loop if github exception is not 409
     else:
       print("Pipeline table updation failed")
       break
