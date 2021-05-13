import {processImageFile} from "../src/services";
import {mockResponse} from "mock-req-res";

describe('Test process image function', () => {
  it('The process function should return true', async () => {
    const result = await processImageFile({name: 'fjord', height: 200, width: 200, extension: 'jpg'}, mockResponse());
    expect(result).toBeTruthy();
  });
  it('The process function should return false', async () => {
    const result = await processImageFile({name: 'wrong file', height: 200, width: 200, extension: 'jpg'}, mockResponse());
    expect(result).toBeFalsy();
  });
})
