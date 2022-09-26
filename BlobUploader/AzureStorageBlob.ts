import { BlobServiceClient, BlockBlobParallelUploadOptions, ContainerClient} from '@azure/storage-blob';

export interface IBlobConfig {
  storageName: string;
  storagePath: string;
  sasToken: string;
}

export declare type TransferProgressEvent = {
  loadedBytes: number;
};

const getBlobsInContainer = async (containerClient: ContainerClient, blobConfig : IBlobConfig) => {
  const returnedBlobUrls: string[] = [];

  // get list of blobs in container
  // eslint-disable-next-line
  for await (const blob of containerClient.listBlobsFlat()) {
    // if image is public, just construct URL
    returnedBlobUrls.push(
      `https://${blobConfig.storageName}.blob.core.windows.net/${blobConfig.storagePath}/${blob.name}`
    );
  }

  return returnedBlobUrls;
}
// eslint-disable-next-line no-unused-vars
const createBlobInContainer = async (containerClient: ContainerClient, file: File, onProgress?: (progress: TransferProgressEvent) => void) => {
  
  // create blobClient for container
  const blobClient = containerClient.getBlockBlobClient(file.name);

  // set mimetype as determined from browser with file upload control
  var options : BlockBlobParallelUploadOptions = { blobHTTPHeaders: { blobContentType: file.type } };
  if (onProgress) { options.onProgress = onProgress;}

  // upload file
  await blobClient.uploadData(file, options);
}
// eslint-disable-next-line no-unused-vars
const uploadFileToBlob = async (file: File | null, blobConfig: IBlobConfig, onProgress?: (progress: TransferProgressEvent) => void): Promise<string[]> => {
  if (!file) return [];

  // get BlobService = notice `?` is pulled out of sasToken - if created in Azure portal
  const blobService = new BlobServiceClient(
    `https://${blobConfig.storageName}.blob.core.windows.net/?${blobConfig.sasToken}`
  );

  const containerClient: ContainerClient = blobService.getContainerClient(blobConfig.storagePath);
  // await containerClient.createIfNotExists({
  //   access: 'container',
  // });

  // upload file
  await createBlobInContainer(containerClient, file, onProgress);

  // get list of blobs in container
  //return getBlobsInContainer(containerClient, blobConfig);
  return [];
};

export default uploadFileToBlob;

