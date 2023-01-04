





1. 安装kubeadm的相关源
2. 



```
apt remove kubeadm kubectl kubelet -y
apt-get install -y kubelet=1.25.1-00 kubeadm=1.25.1-00 kubectl=1.25.1-00

```

```
Your Kubernetes control-plane has initialized successfully!

To start using your cluster, you need to run the following as a regular user:

  mkdir -p $HOME/.kube
  sudo cp -i /etc/kubernetes/admin.conf $HOME/.kube/config
  sudo chown $(id -u):$(id -g) $HOME/.kube/config

Alternatively, if you are the root user, you can run:

  export KUBECONFIG=/etc/kubernetes/admin.conf

You should now deploy a pod network to the cluster.
Run "kubectl apply -f [podnetwork].yaml" with one of the options listed at:
  https://kubernetes.io/docs/concepts/cluster-administration/addons/

You can now join any number of control-plane nodes by copying certificate authorities
and service account keys on each node and then running the following as root:

  kubeadm join 172.16.1.119:6443 --token abcdef.0123456789abcdef \
	--discovery-token-ca-cert-hash sha256:98363344d90bc1e193a916fa611699a0eb1e191ef59bfb251426b01353f919dc \
	--control-plane 

Then you can join any number of worker nodes by running the following on each as root:

kubeadm join 172.16.1.119:6443 --token abcdef.0123456789abcdef \
	--discovery-token-ca-cert-hash sha256:98363344d90bc1e193a916fa611699a0eb1e191ef59bfb251426b01353f919dc 
root@master-1:~# history 

```

