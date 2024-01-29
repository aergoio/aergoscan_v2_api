import { AergoClient, GrpcProvider, GrpcWebProvider } from "@herajs/client";
import cfg from "../config/config";

export function heraGrpcProvider(chainId) {
    let aergoClientType;
    try {
        if (chainId == "mainnet") {
            aergoClientType = new AergoClient(
                {},
                new GrpcProvider({ url: cfg.NODE_GRPC_MAIN })
            );
        } else if (chainId == "testnet") {
            aergoClientType = new AergoClient(
                {},
                new GrpcProvider({ url: cfg.NODE_GRPC_TEST })
            );
        } else if (chainId == "alpha") {
            aergoClientType = new AergoClient(
                {},
                new GrpcProvider({ url: cfg.NODE_GRPC_ALPHA })
            );
        }
    } catch (e) {
        console.log("heraGrpcProvider = " + e);
    }
    return aergoClientType;
}
