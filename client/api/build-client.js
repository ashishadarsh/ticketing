import axios from "axios";

export default ({ req }) => {
    if(typeof window === "undefined") {
        // We are on the server
        // request should be made to http://<ingress_service>.<ingress_namespace>..svc.cluster.local/api/users/currentuser
        try {
          return axios.create({
            baseURL: 'http://ingress-nginx-controller.ingress-nginx.svc.cluster.local',
            headers: req.headers
          })
        } catch (err) {
          return {};
        }
      } else {
        // We are in browser
        // Request should be made to base url i.e. ''
        try {
          return axios.create({
            baseURL: '/'
          })
        } catch (err) {
          return {};
        }
      }
};