### Changed

- **Quieter FileUpload.** The upload icon in the drop zone no longer sits in its own bordered box, the upload, file and status icons are all 16px, and a failed file row keeps its neutral border: the alert icon and message carry the red. Retry and delete are unchanged. No props change; the contract drops `status.dangerBorder` and `radius.controlMd`
