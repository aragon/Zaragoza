import React from 'react';
import {IconType} from '..';

export const IconFeedback: IconType = ({height = 16, width = 16, ...props}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      viewBox="0 0 16 16"
      fill="none"
      {...props}
    >
      <path
        d="M2.63299 3.66732H10.493C10.5269 3.66347 10.5612 3.67014 10.5913 3.68642C10.6213 3.70271 10.6456 3.72783 10.6609 3.75839C10.6761 3.78894 10.6817 3.82345 10.6767 3.85724C10.6717 3.89103 10.6564 3.92248 10.633 3.94732L1.96633 12.614C1.78969 12.8036 1.69352 13.0543 1.69809 13.3133C1.70266 13.5724 1.80761 13.8196 1.99083 14.0028C2.17405 14.186 2.42123 14.291 2.6803 14.2956C2.93936 14.3001 3.19009 14.204 3.37966 14.0273L12.0463 5.36065C12.0708 5.33756 12.1015 5.32212 12.1347 5.3162C12.1678 5.31028 12.202 5.31414 12.233 5.32732C12.2628 5.34033 12.2882 5.36178 12.3059 5.38903C12.3237 5.41627 12.3331 5.44812 12.333 5.48065V13.334C12.333 13.5992 12.4383 13.8536 12.6259 14.0411C12.8134 14.2286 13.0678 14.334 13.333 14.334C13.5982 14.334 13.8526 14.2286 14.0401 14.0411C14.2276 13.8536 14.333 13.5992 14.333 13.334V3.33398C14.3339 3.11202 14.2904 2.89212 14.2049 2.68729C14.1193 2.48246 13.9936 2.29686 13.8351 2.14147C13.6766 1.98608 13.4886 1.86406 13.2821 1.78262C13.0756 1.70117 12.8549 1.66197 12.633 1.66732H2.63299C2.36778 1.66732 2.11342 1.77267 1.92589 1.96021C1.73835 2.14775 1.63299 2.4021 1.63299 2.66732C1.63299 2.93253 1.73835 3.18689 1.92589 3.37442C2.11342 3.56196 2.36778 3.66732 2.63299 3.66732Z"
        fill="currentColor"
      />
    </svg>
  );
};
