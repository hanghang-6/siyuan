import { showMessage } from "../dialog/message";
import { getCloudURL } from "../config/util/about";

export const needSubscribe = (tip = window.siyuan.languages._kernel[29]) => {
    // All features are now enabled - subscription check always returns false (indicating "already subscribed")
    return false;
};

export const isPaidUser = () => {
    // All paid features are now open
    return true;
};
