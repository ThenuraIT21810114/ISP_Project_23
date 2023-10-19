function Rating(props) {
  const { rating, numReviews, caption } = props; // Destructuring props

  return (
    <div className="rating">
      <span>
        <i
          className={
            rating >= 1
              ? 'fas fa-star'
              : rating >= 0.5
              ? 'fas fa-star-half-alt' // Render a half-filled star when the rating is between 0.5 and 1
              : 'far fa-star' // Render an empty star when the rating is less than 0.5
          }
        />
      </span>
      <span>
        <i
          className={
            rating >= 2
              ? 'fas fa-star'
              : rating >= 1.5
              ? 'fas fa-star-half-alt' // Render a half-filled star when the rating is between 1.5 and 2
              : 'far fa-star'
          }
        />
      </span>
      <span>
        <i
          className={
            rating >= 3
              ? 'fas fa-star'
              : rating >= 2.5
              ? 'fas fa-star-half-alt' // Render a half-filled star when the rating is between 2.5 and 3
              : 'far fa-star'
          }
        />
      </span>
      <span>
        <i
          className={
            rating >= 4
              ? 'fas fa-star'
              : rating >= 3.5
              ? 'fas fa-star-half-alt' // Render a half-filled star when the rating is between 3.5 and 4
              : 'far fa-star'
          }
        />
      </span>
      <span>
        <i
          className={
            rating >= 5
              ? 'fas fa-star'
              : rating >= 4.5
              ? 'fas fa-star-half-alt' // Render a half-filled star when the rating is between 4.5 and 5
              : 'far fa-star'
          }
        />
      </span>
      {caption ? (
        <span>{caption}</span> // Render the caption if it's provided in props
      ) : (
        <span>{' ' + numReviews + ' reviews'}</span> // Render the number of reviews if no caption is provided
      )}
    </div>
  );
}

export default Rating;
