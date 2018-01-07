import { TestModel } from "../models/test.model";

export class TestService {
    getModel(): TestModel {
        return new TestModel();
    }
}