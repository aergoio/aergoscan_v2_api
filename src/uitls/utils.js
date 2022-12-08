import {esDb} from "../models/esDb";


/*
export class Utility {

}
*/



function replaceDoubleQuotes(param1) {
    return param1.replace(/\"/gi, "");
}

export { replaceDoubleQuotes }