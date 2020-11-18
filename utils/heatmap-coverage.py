from pandas import DataFrame
import matplotlib.pyplot as plt
import seaborn as sns
import csv,sys

ExperimentName=sys.argv[1]

with open(ExperimentName+'.csv', newline='') as f:
    reader = csv.reader(f)
    data = list(reader)

if ExperimentName == "pod-delete":
    Index = ['Validation','For deployment application','For statefulset application','For deployment config application','PodsAffectedPercentage is 0','PodsAffectedPercentage is 100','PodsAffectedPercentage 0-100','Target Pod Specification','With Annotation Specified','W/o Annotation Specified', 'Sequence=serial, pod_affected_perc=100','Sequence=parallel, pod_affected_perc=100','Abort w/o probes','AuxiliaryAppChecks','Along w/ Probes','Stress: 3600/1s','Memory/CPU footprint for the stress run','Time the execution period','Apps w/ liveness/readiness probes','ARM Cluster','With Force','Without Force','Different base image(alpine/nginx/centos)']
    Cols = ['Is the test added?']
    plt.title("Pod Delete Experiment", fontsize =20)
elif ExperimentName == "container-kill":
    Index = ['Validation','For deployment application','For statefulset application','For deployment config application','PodsAffectedPercentage is 0','PodsAffectedPercentage is 100','PodsAffectedPercentage 0-100','Target Pod Specification','With Annotation Specified','W/o Annotation Specified', 'Sequence=serial, pod_affected_perc=100','Sequence=parallel, pod_affected_perc=100','Abort w/o probes','AuxiliaryAppChecks','Along w/ Probes','Containerd Cluster Runtime','Docker Cluster Runtime','Time the execution period','Apps w/ liveness/readiness probes','ARM Cluster','Large Duration and Interval']
    Cols = ['Is the test added?']
    plt.title("Container Kill Experiment", fontsize =20)
elif ExperimentName == "disk-fill":
    Index = ['Validation','For deployment application','For statefulset application','For deployment config application','PodsAffectedPercentage is 0','PodsAffectedPercentage is 100','PodsAffectedPercentage 0-100','Target Pod Specification','With Annotation Specified','W/o Annotation Specified', 'Sequence=serial, pod_affected_perc=100','Sequence=parallel, pod_affected_perc=100','Abort w/o probes','AuxiliaryAppChecks','Along w/ Probes','Containerd Cluster Runtime','Docker Cluster Runtime','Time the execution period','Apps w/ liveness/readiness probes','ARM Cluster','Application image(nginx/centos/alpine)']
    Cols = ['Is the test added?']
    plt.title("Disk Fill Experiment", fontsize =20)
elif ExperimentName == "pod-cpu-hog":
    Index = ['Validation','For deployment application','For statefulset application','For deployment config application','PodsAffectedPercentage is 0','PodsAffectedPercentage is 100','PodsAffectedPercentage 0-100','Target Pod Specification','With Annotation Specified','W/o Annotation Specified', 'Sequence=serial, pod_affected_perc=100','Sequence=parallel, pod_affected_perc=100','Abort w/o probes','AuxiliaryAppChecks','Along w/ Probes','Containerd Cluster Runtime','Docker Cluster Runtime','Time the execution period','Apps w/ liveness/readiness probes','ARM Cluster','Different base image(alpine/nginx/centos)']
    Cols = ['Is the test added?']
    plt.title("Pod CPU Hog Experiment", fontsize =20)   
elif ExperimentName == "pod-memory-hog":
    Index = ['Validation','For deployment application','For statefulset application','For deployment config application','PodsAffectedPercentage is 0','PodsAffectedPercentage is 100','PodsAffectedPercentage 0-100','Target Pod Specification','With Annotation Specified','W/o Annotation Specified', 'Sequence=serial, pod_affected_perc=100','Sequence=parallel, pod_affected_perc=100','Abort w/o probes','AuxiliaryAppChecks','Along w/ Probes','Containerd Cluster Runtime','Docker Cluster Runtime','Time the execution period','Apps w/ liveness/readiness probes','ARM Cluster','Different base image(alpine/nginx/centos)']
    Cols = ['Is the test added?']
    plt.title("Pod Memory Hog Experiment", fontsize =20)
elif ExperimentName == "pod-network-corruption":
    Index = ['Validation','For deployment application','For statefulset application','For deployment config application','PodsAffectedPercentage is 0','PodsAffectedPercentage is 100','PodsAffectedPercentage 0-100','Target Pod Specification','With Annotation Specified','W/o Annotation Specified', 'Sequence=serial, pod_affected_perc=100','Sequence=parallel, pod_affected_perc=100','Abort w/o probes','AuxiliaryAppChecks','Along w/ Probes','Containerd Cluster Runtime','Docker Cluster Runtime','Time the execution period','Apps w/ liveness/readiness probes','ARM Cluster','Different base image(alpine/nginx/centos)','With Target IP','With Target Host','With Target Container']
    Cols = ['Is the test added?']
    plt.title("Pod Network Corruption Experiment", fontsize =20)
elif ExperimentName == "pod-network-duplication":
    Index = ['Validation','For deployment application','For statefulset application','For deployment config application','PodsAffectedPercentage is 0','PodsAffectedPercentage is 100','PodsAffectedPercentage 0-100','Target Pod Specification','With Annotation Specified','W/o Annotation Specified', 'Sequence=serial, pod_affected_perc=100','Sequence=parallel, pod_affected_perc=100','Abort w/o probes','AuxiliaryAppChecks','Along w/ Probes','Containerd Cluster Runtime','Docker Cluster Runtime','Time the execution period','Apps w/ liveness/readiness probes','ARM Cluster','Different base image(alpine/nginx/centos)','With Target IP','With Target Host','With Target Container']
    Cols = ['Is the test added?']
    plt.title("Pod Network Duplication Experiment", fontsize =20)
elif ExperimentName == "pod-network-latency":
    Index = ['Validation','For deployment application','For statefulset application','For deployment config application','PodsAffectedPercentage is 0','PodsAffectedPercentage is 100','PodsAffectedPercentage 0-100','Target Pod Specification','With Annotation Specified','W/o Annotation Specified', 'Sequence=serial, pod_affected_perc=100','Sequence=parallel, pod_affected_perc=100','Abort w/o probes','AuxiliaryAppChecks','Along w/ Probes','Containerd Cluster Runtime','Docker Cluster Runtime','Time the execution period','Apps w/ liveness/readiness probes','ARM Cluster','Different base image(alpine/nginx/centos)','With Target IP','With Target Host']    
    Cols = ['Is the test added?']
    plt.title("Pod Network Latency Experiment", fontsize =20)    
elif ExperimentName == "pod-network-loss":
    Index = ['Validation','For deployment application','For statefulset application','For deployment config application','PodsAffectedPercentage is 0','PodsAffectedPercentage is 100','PodsAffectedPercentage 0-100','Target Pod Specification','With Annotation Specified','W/o Annotation Specified', 'Sequence=serial, pod_affected_perc=100','Sequence=parallel, pod_affected_perc=100','Abort w/o probes','AuxiliaryAppChecks','Along w/ Probes','Containerd Cluster Runtime','Docker Cluster Runtime','Time the execution period','Apps w/ liveness/readiness probes','ARM Cluster','Different base image(alpine/nginx/centos)','With Target IP','With Target Host']    
    Cols = ['Is the test added?']
    plt.title("Pod Network Loss Experiment", fontsize =20)
elif ExperimentName == "pod-autoscaler":
    Index = ['Validation','For deployment application','For statefulset application','For deployment config application','With Annotation Specified','W/o Annotation Specified','Abort w/o probes','AuxiliaryAppChecks','Along w/ Probes','Containerd Cluster Runtime','Docker Cluster Runtime','Time the execution period','Apps w/ liveness/readiness probes','ARM Cluster','Different base image(alpine/nginx/centos)','With less replicas(say 5)','with more replicas(say 20)']    
    Cols = ['Is the test added?']
    plt.title("Pod Autoscaler Experiment", fontsize =20)
elif ExperimentName == "kubelet-service-kill":
    Index = ['Validation','For deployment application','For statefulset application','For deployment config application','With Target Node Specified','With Annotation Specified','W/o Annotation Specified','Abort w/o probes','AuxiliaryAppChecks','Along w/ Probes','Containerd Cluster Runtime','Docker Cluster Runtime','Time the execution period','Apps w/ liveness/readiness probes','ARM Cluster','Different lib image(ubuntu/centos)','Without appinfo']    
    Cols = ['Is the test added?']
    plt.title("Kubelet Service Kill", fontsize =20)
elif ExperimentName == "node-cpu-hog":
    Index = ['Validation','For deployment application','For statefulset application','For deployment config application','NodeAffectedPercentage is 0','NodeAffectedPercentage is 100','NodeAffectedPercentage 0-100','Target Node Specification','With Annotation Specified','W/o Annotation Specified', 'Sequence=serial, node_affected_perc=100','Sequence=parallel, node_affected_perc=100','Abort w/o probes','AuxiliaryAppChecks','Along w/ Probes','Apps w/ liveness/readiness probes','ARM Cluster','Different base image(alpine/nginx/centos)','Without appinfo']
    Cols = ['Is the test added?']
    plt.title("Node CPU Hog", fontsize =20)
elif ExperimentName == "node-memory-hog":
    Index = ['Validation','For deployment application','For statefulset application','For deployment config application','NodeAffectedPercentage is 0','NodeAffectedPercentage is 100','NodeAffectedPercentage 0-100','Target Node Specification','With Annotation Specified','W/o Annotation Specified', 'Sequence=serial, node_affected_perc=100','Sequence=parallel, node_affected_perc=100','Abort w/o probes','AuxiliaryAppChecks','Along w/ Probes','Apps w/ liveness/readiness probes','ARM Cluster','Different base image(alpine/nginx/centos)','Without appinfo']
    Cols = ['Is the test added?']
    plt.title("Node Memory Hog", fontsize =20)
elif ExperimentName == "node-drain":
    Index = ['Validation','For deployment application','For statefulset application','For deployment config application','With Annotation Specified','W/o Annotation Specified','Abort w/o probes','AuxiliaryAppChecks','Along w/ Probes','Containerd Cluster Runtime','Docker Cluster Runtime','Apps w/ liveness/readiness probes','ARM Cluster','Different base image(alpine/nginx/centos)','Target node specified','Without appinfo']    
    Cols = ['Is the test added?']
    plt.title("Node Drain Experiment", fontsize =20)   
elif ExperimentName == "node-taint":
    Index = ['Validation','For deployment application','For statefulset application','For deployment config application','With Annotation Specified','W/o Annotation Specified','Abort w/o probes','AuxiliaryAppChecks','Along w/ Probes','Containerd Cluster Runtime','Docker Cluster Runtime','Apps w/ liveness/readiness probes','ARM Cluster','Different base image(alpine/nginx/centos)','Target node specified','Without appinfo']    
    Cols = ['Is the test added?']
    plt.title("Node Taint Experiment", fontsize =20) 
elif ExperimentName == "node-io-stress":
    Index = ['Validation','For deployment application','For statefulset application','For deployment config application','NodeAffectedPercentage is 0','NodeAffectedPercentage is 100','NodeAffectedPercentage 0-100','Target Node Specification','With Annotation Specified','W/o Annotation Specified', 'Sequence=serial, node_affected_perc=100','Sequence=parallel, node_affected_perc=100','Abort w/o probes','AuxiliaryAppChecks','Along w/ Probes','Apps w/ liveness/readiness probes','ARM Cluster','Different base image(alpine/nginx/centos)','Without appinfo','W/ filesystem utilisation bytes specified','w/ filesystem utilisation percentage specified']
    Cols = ['Is the test added?']
    plt.title("Node IO Stress", fontsize =20)         
elif ExperimentName == "pod-io-stress":
    Index = ['Validation','For deployment application','For statefulset application','For deployment config application','PodAffectedPercentage is 0','PodAffectedPercentage is 100','PodAffectedPercentage 0-100','Target Pod Specification','With Annotation Specified','W/o Annotation Specified', 'Sequence=serial, pod_affected_perc=100','Sequence=parallel, pod_affected_perc=100','Abort w/o probes','AuxiliaryAppChecks','Along w/ Probes','Apps w/ liveness/readiness probes','ARM Cluster','Different base image(alpine/nginx/centos)','Without appinfo','W/ filesystem utilisation bytes specified','w/ filesystem utilisation percentage specified','w/ Volume mouth path specified']
    Cols = ['Is the test added?']
    plt.title("Pod IO Stress", fontsize =20)        
else:
    print("Experiment %s not supported",ExperimentName)

df = DataFrame(data, index=Index, columns=Cols)
df = df[df.columns].astype(float)

print(df)
svm = sns.heatmap(df, cmap="Reds")
figure = svm.get_figure()

plt.subplots_adjust(left=0.218,bottom=0.095,right=0.9,top=0.88,wspace=0.2,hspace=0.2)
figure.set_figheight(10)
figure.set_figwidth(15)
plt.savefig(ExperimentName+'-heatmap.png', dpi=250)
