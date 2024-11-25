import {AES, enc} from "crypto-js"


export function encrypt(text: string, password: string) {
    if (password != "")
    {
        return AES.encrypt(text, password).toString();
    }
    return text;
}

export function decrypt(text: string, password: string) {
    if (password != "")
    {
        try{
            const out_text = AES.decrypt(text, password).toString(enc.Utf8);
            if(out_text != "")
            {
                return out_text;
            }
        }
        catch (error)
        {
            console.log("Failed to decrypt:", error, text);
        }
    }
    return text;
    
}
